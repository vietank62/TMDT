import hmac
import uuid
from datetime import timedelta

from django.conf import settings
from django.shortcuts import get_object_or_404
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from bookings.models import Booking
from common.pagination import PageNumberPagination
from common.utils import compute_hmac_sha256

from .models import Payment
from .serializers import PaymentSerializer

_NOT_IMPLEMENTED = Response(
    {"detail": "Not implemented."},
    status=status.HTTP_501_NOT_IMPLEMENTED,
)


def _create_sepay_order_id(booking_id: str) -> str:
    return f"SEPAY-{booking_id}-{uuid.uuid4().hex[:12]}"


def _get_sepay_signature(request):
    return (
        request.headers.get("X-SEPay-Signature")
        or request.headers.get("X-SEPAY-Signature")
        or request.META.get("HTTP_X_SEPAY_SIGNATURE")
        or request.META.get("HTTP_X_SEPAY_SIGNATURE")
    )


def _verify_sepay_signature(request):
    signature = _get_sepay_signature(request)
    if not signature:
        return False

    secret = getattr(settings, "SEPAY_MERCHANT_SECRET_KEY", "")
    if not secret:
        return False

    payload = request.body.decode("utf-8", errors="ignore")
    expected = compute_hmac_sha256(secret, payload)
    return hmac.compare_digest(signature, expected)


# ── Payments ───────────────────────────────────────────────────────────────────


class PaymentListView(APIView):
    """GET /api/v1/payments — list current user's payments."""

    permission_classes = [IsAuthenticated]

    @extend_schema(operation_id="listMyPayments", tags=["Payments"])
    def get(self, request):
        queryset = Payment.objects.filter(user=request.user).order_by("-created_at")
        paginator = PageNumberPagination()
        page = paginator.paginate_queryset(queryset, request, view=self)
        serializer = PaymentSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


class PaymentOrderCreateView(APIView):
    """POST /api/v1/payments/bookings/{bookingId} — create SEPay order."""

    permission_classes = [IsAuthenticated]

    @extend_schema(operation_id="createPaymentOrder", tags=["Payments"])
    def post(self, request, booking_id):
        booking = get_object_or_404(
            Booking.objects.select_related("expert", "user"),
            id=booking_id,
            user=request.user,
        )

        if booking.status != Booking.APPROVED_AWAITING_PAYMENT:
            return Response(
                {"detail": "Payment can only be created for bookings awaiting payment."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            payment = booking.payment
        except Payment.DoesNotExist:
            payment = None

        if payment is not None:
            if payment.status != Payment.PENDING:
                return Response(
                    {"detail": "This booking already has a processed payment."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            return Response(PaymentSerializer(payment).data)

        sepay_order_id = _create_sepay_order_id(str(booking.id))
        payment = Payment.objects.create(
            booking=booking,
            user=request.user,
            expert=booking.expert,
            amount=booking.price_vnd,
            sepay_order_id=sepay_order_id,
            sepay_qr_code=f"https://sepay.example.com/qrcode/{sepay_order_id}",
            expires_at=timezone.now() + timedelta(minutes=30),
        )

        return Response(PaymentSerializer(payment).data, status=status.HTTP_201_CREATED)


class PaymentDetailView(APIView):
    """GET /api/v1/payments/{paymentId}."""

    permission_classes = [IsAuthenticated]

    @extend_schema(operation_id="getPayment", tags=["Payments"])
    def get(self, request, payment_id):
        payment = get_object_or_404(Payment, id=payment_id, user=request.user)
        return Response(PaymentSerializer(payment).data)


class SEPayWebhookView(APIView):
    """POST /api/v1/payments/webhook/sepay — HMAC-verified, no auth."""

    permission_classes = [AllowAny]
    authentication_classes = []

    @extend_schema(operation_id="handleSepayWebhook", tags=["Payments"])
    def post(self, request):
        if not _verify_sepay_signature(request):
            return Response(
                {"detail": "Invalid SEPay signature."},
                status=status.HTTP_403_FORBIDDEN,
            )

        payload = request.data
        order_id = payload.get("order_id") or payload.get("sepay_order_id")
        payment = None
        if order_id:
            payment = Payment.objects.filter(sepay_order_id=order_id).first()

        if not payment and payload.get("payment_id"):
            payment = Payment.objects.filter(id=payload["payment_id"]).first()

        if payment is None:
            return Response({"detail": "Payment not found."}, status=status.HTTP_404_NOT_FOUND)

        status_value = str(payload.get("status", "")).strip().lower()
        transaction_id = payload.get("transaction_id")
        transfer_code = payload.get("transfer_code")

        update_fields = []
        if transaction_id:
            payment.sepay_transaction_id = transaction_id
            update_fields.append("sepay_transaction_id")
        if transfer_code:
            payment.transfer_code = transfer_code
            update_fields.append("transfer_code")

        if status_value in {"paid", "completed", "success"}:
            payment.status = Payment.PAID
            payment.paid_at = timezone.now()
            update_fields.extend(["status", "paid_at"])
            if payment.booking.status != Booking.PAID_CONFIRMED:
                payment.booking.status = Booking.PAID_CONFIRMED
                payment.booking.save(update_fields=["status", "updated_at"])
        elif status_value in {"failed", "cancelled", "declined"}:
            payment.status = Payment.FAILED
            update_fields.append("status")
        elif status_value in {"refunded", "refund"}:
            payment.status = Payment.REFUNDED
            payment.refunded_at = timezone.now()
            update_fields.extend(["status", "refunded_at"])

        if update_fields:
            payment.save(update_fields=list(dict.fromkeys(update_fields)) + ["updated_at"])

        return Response(status=status.HTTP_200_OK)


# ── Refunds ────────────────────────────────────────────────────────────────────


class RefundByBookingView(APIView):
    """GET /api/v1/refunds/bookings/{bookingId}."""

    permission_classes = [IsAuthenticated]

    @extend_schema(operation_id="getRefundByBooking", tags=["Refunds"])
    def get(self, request, booking_id):
        booking = get_object_or_404(
            Booking.objects.select_related("expert", "user"),
            id=booking_id,
            user=request.user,
        )

        try:
            payment = booking.payment
        except Payment.DoesNotExist:
            payment = None

        if payment is None or (
            payment.status != Payment.REFUNDED
            and payment.refund_amount == 0
            and booking.status not in [Booking.REFUND_PENDING, Booking.REFUNDED]
        ):
            return Response({"detail": "Refund not found."}, status=status.HTTP_404_NOT_FOUND)

        return Response(PaymentSerializer(payment).data)
