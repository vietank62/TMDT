import uuid

from django.conf import settings
from django.db import IntegrityError, transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from audit_logs.models import AuditLog
from bookings.models import Booking
from common.pagination import PageNumberPagination
from common.permissions import IsAnyAuthenticatedRole
from notifications.models import Notification

from .models import Payment
from .serializers import PaymentSerializer


def _create_sepay_order_id(booking_id: str) -> str:
    return f"SEPAY-{booking_id}-{uuid.uuid4().hex[:12]}"


def _build_qr_url(amount: int, order_id: str) -> str:
    bank_account = getattr(settings, "SEPAY_BANK_ACCOUNT", "")
    bank_code = getattr(settings, "SEPAY_BANK_CODE", "")
    pre_description = getattr(settings, "SEPAY_PRE_DESCRIPTION", "MICROMENTOR")
    description = f"{pre_description}-{order_id}"
    return (
        f"https://qr.sepay.vn/img"
        f"?acc={bank_account}"
        f"&bank={bank_code}"
        f"&amount={amount}"
        f"&des={description}"
    )


def _get_client_ip(request) -> str | None:
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        return x_forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


# ── Payments ───────────────────────────────────────────────────────────────────


class PaymentListView(APIView):
    """GET /api/v1/payments — list current user's payments."""

    permission_classes = [IsAnyAuthenticatedRole]

    @extend_schema(operation_id="listMyPayments", tags=["Payments"])
    def get(self, request):
        queryset = Payment.objects.filter(user=request.user).order_by("-created_at")
        paginator = PageNumberPagination()
        page = paginator.paginate_queryset(queryset, request, view=self)
        serializer = PaymentSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


class PaymentOrderCreateView(APIView):
    """POST /api/v1/payments/bookings/{bookingId} — create SEPay order."""

    permission_classes = [IsAnyAuthenticatedRole]

    @extend_schema(operation_id="createPaymentOrder", tags=["Payments"])
    @transaction.atomic
    def post(self, request, booking_id):
        booking = get_object_or_404(
            Booking.objects.select_related("expert", "user").select_for_update(),
            id=booking_id,
            user=request.user,
        )

        if booking.status != Booking.APPROVED_AWAITING_PAYMENT:
            return Response(
                {"detail": "Payment can only be created for bookings awaiting payment."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Guard: payment deadline already passed.
        if booking.payment_deadline and timezone.now() > booking.payment_deadline:
            return Response(
                {"detail": "Payment deadline has expired."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        payment = Payment.objects.filter(booking=booking).first()

        if payment is not None:
            if payment.status != Payment.PENDING:
                return Response(
                    {"detail": "This booking already has a processed payment."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            return Response(PaymentSerializer(payment).data)

        sepay_order_id = _create_sepay_order_id(str(booking.id))
        try:
            payment = Payment.objects.create(
                booking=booking,
                user=request.user,
                expert=booking.expert,
                amount=booking.price_vnd,
                sepay_order_id=sepay_order_id,
                sepay_qr_code=_build_qr_url(booking.price_vnd, sepay_order_id),
                expires_at=booking.payment_deadline,
            )
        except IntegrityError:
            # Concurrent request already created the payment; return the existing one.
            payment = Payment.objects.get(booking=booking)
            return Response(PaymentSerializer(payment).data)

        AuditLog.objects.create(
            actor=request.user,
            actor_role=AuditLog.ROLE_USER,
            action="create_payment",
            target_type="payment",
            target_id=str(payment.id),
            previous_state={},
            new_state={"status": payment.status, "amount": payment.amount},
            ip_address=_get_client_ip(request),
        )

        return Response(PaymentSerializer(payment).data, status=status.HTTP_201_CREATED)


class PaymentDetailView(APIView):
    """GET /api/v1/payments/{paymentId}."""

    permission_classes = [IsAnyAuthenticatedRole]

    @extend_schema(operation_id="getPayment", tags=["Payments"])
    def get(self, request, payment_id):
        payment = get_object_or_404(Payment, id=payment_id, user=request.user)
        return Response(PaymentSerializer(payment).data)


def _resolve_payment(payload) -> Payment | None:
    qs = Payment.objects.select_related("booking", "booking__user", "booking__expert__user")
    order_id = payload.get("order_id") or payload.get("sepay_order_id")
    if order_id:
        payment = qs.filter(sepay_order_id=order_id).first()
        if payment:
            return payment
    if payload.get("payment_id"):
        return qs.filter(id=payload["payment_id"]).first()
    return None


def _apply_paid(payment: Payment, old_booking_status: str, update_fields: list) -> None:
    payment.status = Payment.PAID
    payment.paid_at = timezone.now()
    update_fields.extend(["status", "paid_at"])
    if payment.booking.status == Booking.PAID_CONFIRMED:
        return
    payment.booking.status = Booking.PAID_CONFIRMED
    payment.booking.save(update_fields=["status", "updated_at"])
    AuditLog.objects.create(
        actor=None,
        actor_role=AuditLog.ROLE_SYSTEM,
        action="confirm_payment",
        target_type="booking",
        target_id=str(payment.booking.id),
        previous_state={"status": old_booking_status},
        new_state={"status": Booking.PAID_CONFIRMED},
    )
    Notification.objects.bulk_create(
        [
            Notification(
                user=payment.booking.user,
                type="payment_confirmed",
                title="Thanh toán thành công",
                message="Thanh toán của bạn đã được xác nhận. Buổi tư vấn đã được đặt lịch.",
                related_booking=payment.booking,
            ),
            Notification(
                user=payment.booking.expert.user,
                type="payment_confirmed",
                title="Buổi tư vấn đã được thanh toán",
                message="Người dùng đã thanh toán. Buổi tư vấn của bạn đã được xác nhận.",
                related_booking=payment.booking,
            ),
        ]
    )


def _apply_refunded(payment: Payment, old_status: str, update_fields: list) -> None:
    payment.status = Payment.REFUNDED
    payment.refunded_at = timezone.now()
    update_fields.extend(["status", "refunded_at"])
    AuditLog.objects.create(
        actor=None,
        actor_role=AuditLog.ROLE_SYSTEM,
        action="process_refund",
        target_type="payment",
        target_id=str(payment.id),
        previous_state={"status": old_status},
        new_state={"status": Payment.REFUNDED},
    )
    Notification.objects.create(
        user=payment.booking.user,
        type="refund_completed",
        title="Hoàn tiền thành công",
        message="Khoản hoàn tiền của bạn đã được xử lý thành công.",
        related_booking=payment.booking,
    )


class SEPayWebhookView(APIView):
    """POST /api/v1/payments/webhook/sepay — HMAC-verified, no auth."""

    permission_classes = [AllowAny]
    authentication_classes: list[type] = []

    @extend_schema(operation_id="handleSepayWebhook", tags=["Payments"])
    def post(self, request):
        payload = request.data
        payment = _resolve_payment(payload)
        if payment is None:
            return Response({"detail": "Payment not found."}, status=status.HTTP_404_NOT_FOUND)

        status_value = str(payload.get("status", "")).strip().lower()
        update_fields = []

        if payload.get("transaction_id"):
            payment.sepay_transaction_id = payload["transaction_id"]
            update_fields.append("sepay_transaction_id")
        if payload.get("transfer_code"):
            payment.transfer_code = payload["transfer_code"]
            update_fields.append("transfer_code")

        old_payment_status = payment.status
        old_booking_status = payment.booking.status

        if status_value in {"paid", "completed", "success"}:
            _apply_paid(payment, old_booking_status, update_fields)
        elif status_value in {"failed", "cancelled", "declined"}:
            payment.status = Payment.FAILED
            update_fields.append("status")
        elif status_value in {"refunded", "refund"}:
            _apply_refunded(payment, old_payment_status, update_fields)

        if update_fields:
            payment.save(update_fields=list(dict.fromkeys(update_fields)) + ["updated_at"])
            if old_payment_status != payment.status:
                AuditLog.objects.create(
                    actor=None,
                    actor_role=AuditLog.ROLE_SYSTEM,
                    action="update_payment_status",
                    target_type="payment",
                    target_id=str(payment.id),
                    previous_state={"status": old_payment_status},
                    new_state={"status": payment.status},
                )

        return Response(status=status.HTTP_200_OK)


# ── Refunds ────────────────────────────────────────────────────────────────────


class RefundByBookingView(APIView):
    """GET /api/v1/refunds/bookings/{bookingId}."""

    permission_classes = [IsAnyAuthenticatedRole]

    @extend_schema(operation_id="getRefundByBooking", tags=["Refunds"])
    def get(self, request, booking_id):
        booking = get_object_or_404(
            Booking.objects.select_related("expert", "user"),
            id=booking_id,
            user=request.user,
        )

        payment = Payment.objects.filter(booking=booking).first()

        if payment is None or (
            payment.status != Payment.REFUNDED
            and payment.refund_amount == 0
            and booking.status not in [Booking.REFUND_PENDING, Booking.REFUNDED]
        ):
            return Response({"detail": "Refund not found."}, status=status.HTTP_404_NOT_FOUND)

        return Response(PaymentSerializer(payment).data)
