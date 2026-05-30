import contextlib
from datetime import timedelta

from django.conf import settings
from django.db import transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from audit_logs.models import AuditLog
from common.pagination import PageNumberPagination
from common.permissions import IsExpert, IsUser, IsUserOrExpert
from common.utils import generate_agora_token
from experts.models import AvailabilitySlot, Expert
from notifications.models import Notification

from .models import Booking, BookingSlot
from .serializers import (
    ApproveBookingSerializer,
    BookingSerializer,
    CancelBookingSerializer,
    CreateBookingSerializer,
    RejectBookingSerializer,
    SessionTokenSerializer,
)


def _get_client_ip(request) -> str | None:
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        return x_forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


def _actor_role(user, booking=None) -> str:
    """Return the AuditLog role constant for the acting user."""
    if user.is_staff:
        return AuditLog.ROLE_ADMIN
    if booking and hasattr(user, "expert_profile") and booking.expert.user_id == user.id:
        return AuditLog.ROLE_EXPERT
    return AuditLog.ROLE_USER


def _log(request, action: str, target_id: str, previous_state: dict, new_state: dict, role: str):
    AuditLog.objects.create(
        actor=request.user,
        actor_role=role,
        action=action,
        target_type="booking",
        target_id=target_id,
        previous_state=previous_state,
        new_state=new_state,
        ip_address=_get_client_ip(request),
    )


def _notify(user, title: str, message: str, notif_type: str, booking=None):
    Notification.objects.create(
        user=user,
        type=notif_type,
        title=title,
        message=message,
        related_booking=booking,
    )


def _bookings_visible_to(user):
    return (
        Booking.objects.select_related("user", "expert", "expert__user")
        .prefetch_related("booking_slots")
        .filter(Q(user=user) | Q(expert__user=user))
    )


def _get_visible_booking(user, booking_id):
    return get_object_or_404(_bookings_visible_to(user), id=booking_id)


def _is_booking_expert(user, booking):
    return booking.expert.user_id == user.id


class BookingListCreateView(APIView):
    """GET/POST /api/v1/bookings."""

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsUser()]
        return [IsUserOrExpert()]

    @extend_schema(
        operation_id="listMyBookings",
        tags=["Bookings"],
        responses=BookingSerializer(many=True),
    )
    def get(self, request):
        queryset = _bookings_visible_to(request.user).order_by("-created_at")
        paginator = PageNumberPagination()
        page = paginator.paginate_queryset(queryset, request, view=self)
        serializer = BookingSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    @extend_schema(
        operation_id="createBooking",
        tags=["Bookings"],
        request=CreateBookingSerializer,
        responses=BookingSerializer,
    )
    @transaction.atomic
    def post(self, request):
        serializer = CreateBookingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        expert = get_object_or_404(
            Expert.objects.select_related("user"),
            id=serializer.validated_data["expert_id"],
            profile_status=Expert.APPROVED,
        )
        if expert.user_id == request.user.id:
            return Response(
                {"detail": "Experts cannot book their own profile."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        slots = list(
            AvailabilitySlot.objects.select_for_update()
            .filter(
                id__in=serializer.validated_data["slot_ids"],
                expert=expert,
                is_booked=False,
            )
            .order_by("start_time")
        )
        if len(slots) != len(set(serializer.validated_data["slot_ids"])):
            return Response(
                {"slot_ids": ["One or more slots are unavailable."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate consecutive 15-min slots — no gaps allowed.
        for i in range(len(slots) - 1):
            expected_next = slots[i].start_time + timedelta(minutes=15)
            if slots[i + 1].start_time != expected_next:
                return Response(
                    {"slot_ids": ["Slots must be consecutive with no gaps."]},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        booking = Booking.objects.create(
            user=request.user,
            expert=expert,
            status=Booking.PENDING_APPROVAL,
            problem_description=serializer.validated_data["problem_description"],
            session_goals=serializer.validated_data["session_goals"],
            document_urls=serializer.validated_data.get("document_urls", []),
            scheduled_at=slots[0].start_time,
            duration_minutes=len(slots) * 15,
            price_vnd=len(slots) * expert.price_per_session,
            expert_response_deadline=timezone.now() + timedelta(hours=24),
            agora_channel=f"booking-{timezone.now().timestamp()}",
        )
        BookingSlot.objects.bulk_create([BookingSlot(booking=booking, slot=slot) for slot in slots])
        AvailabilitySlot.objects.filter(id__in=[slot.id for slot in slots]).update(is_booked=True)

        _log(
            request,
            "create_booking",
            str(booking.id),
            {},
            {"status": booking.status},
            AuditLog.ROLE_USER,
        )
        _notify(
            expert.user,
            "Yêu cầu tư vấn mới",
            f"Bạn có yêu cầu tư vấn mới từ {request.user.full_name or request.user.email}.",
            "new_booking_request",
            booking=booking,
        )

        booking = _get_visible_booking(request.user, booking.id)
        return Response(BookingSerializer(booking).data, status=status.HTTP_201_CREATED)


class BookingDetailView(APIView):
    """GET /api/v1/bookings/{bookingId}."""

    permission_classes = [IsUserOrExpert]

    @extend_schema(operation_id="getBooking", tags=["Bookings"], responses=BookingSerializer)
    def get(self, request, booking_id):
        booking = _get_visible_booking(request.user, booking_id)
        return Response(BookingSerializer(booking).data)


class BookingApproveView(APIView):
    """POST /api/v1/bookings/{bookingId}/approve."""

    permission_classes = [IsExpert]

    @extend_schema(
        operation_id="approveBooking",
        tags=["Bookings"],
        request=ApproveBookingSerializer,
        responses=BookingSerializer,
    )
    def post(self, request, booking_id):
        booking = _get_visible_booking(request.user, booking_id)
        if not _is_booking_expert(request.user, booking):
            return Response({"detail": "Only the expert can approve this booking."}, status=403)

        if booking.status != Booking.PENDING_APPROVAL:
            return Response(
                {"detail": "Only pending bookings can be approved."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = ApproveBookingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        old_status = booking.status
        booking.status = Booking.APPROVED_AWAITING_PAYMENT
        booking.expert_note = serializer.validated_data.get("expert_note", "")
        # Deadline: 24 h from now OR session start time, whichever is earlier.
        deadline_24h = timezone.now() + timedelta(hours=24)
        booking.payment_deadline = min(deadline_24h, booking.scheduled_at)
        booking.save(update_fields=["status", "expert_note", "payment_deadline", "updated_at"])

        _log(
            request,
            "approve_booking",
            str(booking.id),
            {"status": old_status},
            {"status": booking.status},
            AuditLog.ROLE_EXPERT,
        )
        _notify(
            booking.user,
            "Yêu cầu tư vấn được chấp nhận",
            "Chuyên gia đã chấp nhận yêu cầu. Vui lòng thanh toán để xác nhận lịch.",
            "booking_approved",
            booking=booking,
        )

        return Response(BookingSerializer(booking).data)


class BookingRejectView(APIView):
    """POST /api/v1/bookings/{bookingId}/reject."""

    permission_classes = [IsExpert]

    @extend_schema(
        operation_id="rejectBooking",
        tags=["Bookings"],
        request=RejectBookingSerializer,
        responses=BookingSerializer,
    )
    def post(self, request, booking_id):
        booking = _get_visible_booking(request.user, booking_id)
        if not _is_booking_expert(request.user, booking):
            return Response({"detail": "Only the expert can reject this booking."}, status=403)

        if booking.status != Booking.PENDING_APPROVAL:
            return Response(
                {"detail": "Only pending bookings can be rejected."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = RejectBookingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        old_status = booking.status
        booking.status = Booking.REJECTED
        booking.rejection_reason = serializer.validated_data["rejection_reason"]
        booking.save(update_fields=["status", "rejection_reason", "updated_at"])
        AvailabilitySlot.objects.filter(booking_slots__booking=booking).update(is_booked=False)

        _log(
            request,
            "reject_booking",
            str(booking.id),
            {"status": old_status},
            {"status": booking.status},
            AuditLog.ROLE_EXPERT,
        )
        _notify(
            booking.user,
            "Yêu cầu tư vấn bị từ chối",
            f"Chuyên gia đã từ chối yêu cầu: {booking.rejection_reason}",
            "booking_rejected",
            booking=booking,
        )

        return Response(BookingSerializer(booking).data)


class BookingCancelView(APIView):
    """POST /api/v1/bookings/{bookingId}/cancel."""

    permission_classes = [IsUserOrExpert]

    @extend_schema(
        operation_id="cancelBooking",
        tags=["Bookings"],
        request=CancelBookingSerializer,
        responses=BookingSerializer,
    )
    def post(self, request, booking_id):
        booking = _get_visible_booking(request.user, booking_id)

        old_status = booking.status
        is_expert = _is_booking_expert(request.user, booking)
        booking.status = Booking.CANCELLED_BY_EXPERT if is_expert else Booking.CANCELLED_BY_USER
        reason = CancelBookingSerializer(data=request.data)
        reason.is_valid(raise_exception=True)
        if reason.validated_data.get("reason"):
            booking.rejection_reason = reason.validated_data["reason"]
        booking.save(update_fields=["status", "rejection_reason", "updated_at"])
        AvailabilitySlot.objects.filter(booking_slots__booking=booking).update(is_booked=False)

        role = AuditLog.ROLE_EXPERT if is_expert else AuditLog.ROLE_USER
        _log(
            request,
            "cancel_booking",
            str(booking.id),
            {"status": old_status},
            {"status": booking.status},
            role,
        )

        return Response(BookingSerializer(booking).data)


class BookingCompleteView(APIView):
    """POST /api/v1/bookings/{bookingId}/complete."""

    permission_classes = [IsUserOrExpert]

    @extend_schema(operation_id="completeBooking", tags=["Bookings"], responses=BookingSerializer)
    def post(self, request, booking_id):
        booking = _get_visible_booking(request.user, booking_id)
        if booking.status not in [Booking.PAID_CONFIRMED, Booking.IN_PROGRESS]:
            return Response(
                {"detail": "Only paid or in-progress bookings can be completed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        old_status = booking.status
        booking.status = Booking.COMPLETED
        booking.save(update_fields=["status", "updated_at"])

        role = _actor_role(request.user, booking)
        _log(
            request,
            "complete_booking",
            str(booking.id),
            {"status": old_status},
            {"status": booking.status},
            role,
        )

        return Response(BookingSerializer(booking).data)


class BookingSessionTokenView(APIView):
    """POST /api/v1/bookings/{bookingId}/session-token - Agora RTC token."""

    permission_classes = [IsUserOrExpert]

    @extend_schema(
        operation_id="getSessionToken",
        tags=["Bookings"],
        responses=SessionTokenSerializer,
    )
    def post(self, request, booking_id):
        booking = _get_visible_booking(request.user, booking_id)
        if booking.status not in [Booking.PAID_CONFIRMED, Booking.IN_PROGRESS]:
            return Response(
                {"detail": "Session token is only available for paid sessions."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not booking.agora_channel:
            booking.agora_channel = f"booking-{booking.id}"
            booking.save(update_fields=["agora_channel", "updated_at"])

        app_id = getattr(settings, "AGORA_APP_ID", "")
        app_certificate = getattr(settings, "AGORA_APP_CERTIFICATE", "")
        # Deterministic UID from user PK, truncated to 32-bit unsigned int range.
        uid = abs(hash(str(request.user.id))) % (2**32)

        token = ""
        if app_id and app_certificate:
            with contextlib.suppress(RuntimeError):
                token = generate_agora_token(
                    app_id=app_id,
                    app_certificate=app_certificate,
                    channel_name=booking.agora_channel,
                    uid=uid,
                    expiration_seconds=7200,
                )

        data = {
            "token": token,
            "channel": booking.agora_channel,
            "uid": uid,
            "app_id": app_id,
        }
        return Response(SessionTokenSerializer(data).data)
