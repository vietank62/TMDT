from django.shortcuts import get_object_or_404
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from bookings.models import Booking
from common.pagination import PageNumberPagination
from common.permissions import IsAdminUser
from experts.models import Expert

from .serializers import (
    AdminApplicationActionSerializer,
    AdminApplicationSerializer,
    AdminBookingSerializer,
    AdminSerializer,
    AdminUpdateSerializer,
)

_NOT_IMPLEMENTED = Response({"detail": "Not implemented."}, status=status.HTTP_501_NOT_IMPLEMENTED)


def _get_application(application_id):
    return get_object_or_404(Expert.objects.select_related("user"), id=application_id)


def _get_booking(booking_id):
    return get_object_or_404(
        Booking.objects.select_related("user", "expert", "expert__user"),
        id=booking_id,
    )


def _update_application_status(request, application_id, profile_status):
    serializer = AdminApplicationActionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    application = _get_application(application_id)
    application.profile_status = profile_status
    application.reviewed_at = timezone.now()

    if "admin_note" in serializer.validated_data:
        application.admin_note = serializer.validated_data["admin_note"]

    application.save(update_fields=["profile_status", "reviewed_at", "admin_note", "updated_at"])
    return Response(AdminApplicationSerializer(application).data)


def _has_admin_claim(request):
    claims = request.auth if isinstance(request.auth, dict) else {}
    roles = claims.get("roles") or []
    return bool(
        claims.get("admin")
        or claims.get("is_admin")
        or claims.get("is_staff")
        or claims.get("role") == "admin"
        or "admin" in roles
    )


# ── Admin Auth ─────────────────────────────────────────────────────────────────


class AdminAuthSyncView(APIView):
    """POST /api/v1/admin/auth/sync — sync Firebase admin user."""

    permission_classes = [IsAuthenticated]

    @extend_schema(operation_id="syncAdminUser", tags=["Admin Auth"], responses=AdminSerializer)
    def post(self, request):
        if not request.user.is_staff and not _has_admin_claim(request):
            return Response(
                {"detail": "Admin privileges are required."}, status=status.HTTP_403_FORBIDDEN
            )

        user = request.user
        claims = request.auth if isinstance(request.auth, dict) else {}
        update_fields = []

        if not user.is_staff:
            user.is_staff = True
            update_fields.append("is_staff")

        email = claims.get("email")
        if email and user.email != email:
            user.email = email
            update_fields.append("email")

        full_name = claims.get("name")
        if full_name and user.full_name != full_name:
            user.full_name = full_name
            update_fields.append("full_name")

        avatar_url = claims.get("picture")
        if avatar_url and user.avatar_url != avatar_url:
            user.avatar_url = avatar_url
            update_fields.append("avatar_url")

        if update_fields:
            user.save(update_fields=update_fields)

        return Response(AdminSerializer(user).data)


class AdminAuthMeView(APIView):
    """GET/PATCH /api/v1/admin/auth/me."""

    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(operation_id="getAdminMe", tags=["Admin Auth"], responses=AdminSerializer)
    def get(self, request):
        return Response(AdminSerializer(request.user).data)

    @extend_schema(
        operation_id="updateAdminMe",
        tags=["Admin Auth"],
        request=AdminUpdateSerializer,
        responses=AdminSerializer,
    )
    def patch(self, request):
        serializer = AdminUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        user = request.user
        update_fields = []
        for field, value in serializer.validated_data.items():
            setattr(user, field, value)
            update_fields.append(field)

        if update_fields:
            user.save(update_fields=update_fields)

        return Response(AdminSerializer(user).data)


# ── Dashboard ──────────────────────────────────────────────────────────────────


class AdminDashboardView(APIView):
    """GET /api/v1/admin/dashboard."""

    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(operation_id="getAdminDashboard", tags=["Admin Dashboard"])
    def get(self, request):
        return _NOT_IMPLEMENTED


# ── Users ──────────────────────────────────────────────────────────────────────


class AdminUserListView(APIView):
    """GET /api/v1/admin/users."""

    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(operation_id="adminListUsers", tags=["Admin Users"])
    def get(self, request):
        return _NOT_IMPLEMENTED


class AdminUserDetailView(APIView):
    """GET/PATCH /api/v1/admin/users/{userId}."""

    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(operation_id="adminGetUser", tags=["Admin Users"])
    def get(self, request, user_id):
        return _NOT_IMPLEMENTED

    @extend_schema(operation_id="adminUpdateUser", tags=["Admin Users"])
    def patch(self, request, user_id):
        return _NOT_IMPLEMENTED


# ── Experts ────────────────────────────────────────────────────────────────────


class AdminExpertListView(APIView):
    """GET /api/v1/admin/experts."""

    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(operation_id="adminListExperts", tags=["Admin Experts"])
    def get(self, request):
        return _NOT_IMPLEMENTED


class AdminExpertDetailView(APIView):
    """GET /api/v1/admin/experts/{expertId}."""

    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(operation_id="adminGetExpert", tags=["Admin Experts"])
    def get(self, request, expert_id):
        return _NOT_IMPLEMENTED


class AdminApproveExpertProfileView(APIView):
    """POST /api/v1/admin/experts/{expertId}/approve-profile."""

    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(operation_id="adminApproveExpertProfile", tags=["Admin Experts"])
    def post(self, request, expert_id):
        return _NOT_IMPLEMENTED


class AdminRejectExpertProfileView(APIView):
    """POST /api/v1/admin/experts/{expertId}/reject-profile."""

    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(operation_id="adminRejectExpertProfile", tags=["Admin Experts"])
    def post(self, request, expert_id):
        return _NOT_IMPLEMENTED


# ── Applications ───────────────────────────────────────────────────────────────


class AdminApplicationListView(APIView):
    """GET /api/v1/admin/applications."""

    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(
        operation_id="adminListApplications",
        tags=["Admin Applications"],
        responses=AdminApplicationSerializer(many=True),
    )
    def get(self, request):
        queryset = Expert.objects.select_related("user").order_by("-submitted_at")
        paginator = PageNumberPagination()
        page = paginator.paginate_queryset(queryset, request, view=self)
        serializer = AdminApplicationSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


class AdminApplicationDetailView(APIView):
    """GET /api/v1/admin/applications/{applicationId}."""

    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(
        operation_id="adminGetApplication",
        tags=["Admin Applications"],
        responses=AdminApplicationSerializer,
    )
    def get(self, request, application_id):
        application = _get_application(application_id)
        return Response(AdminApplicationSerializer(application).data)


class AdminApproveApplicationView(APIView):
    """POST /api/v1/admin/applications/{applicationId}/approve."""

    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(
        operation_id="adminApproveApplication",
        tags=["Admin Applications"],
        request=AdminApplicationActionSerializer,
        responses=AdminApplicationSerializer,
    )
    def post(self, request, application_id):
        return _update_application_status(request, application_id, Expert.APPROVED)


class AdminRejectApplicationView(APIView):
    """POST /api/v1/admin/applications/{applicationId}/reject."""

    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(
        operation_id="adminRejectApplication",
        tags=["Admin Applications"],
        request=AdminApplicationActionSerializer,
        responses=AdminApplicationSerializer,
    )
    def post(self, request, application_id):
        return _update_application_status(request, application_id, Expert.REJECTED)


class AdminRequestRevisionView(APIView):
    """POST /api/v1/admin/applications/{applicationId}/request-revision."""

    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(
        operation_id="adminRequestApplicationRevision",
        tags=["Admin Applications"],
        request=AdminApplicationActionSerializer,
        responses=AdminApplicationSerializer,
    )
    def post(self, request, application_id):
        return _update_application_status(request, application_id, Expert.NEEDS_REVISION)


# ── Bookings ───────────────────────────────────────────────────────────────────


class AdminBookingListView(APIView):
    """GET /api/v1/admin/bookings."""

    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(
        operation_id="adminListBookings",
        tags=["Admin Bookings"],
        responses=AdminBookingSerializer(many=True),
    )
    def get(self, request):
        queryset = Booking.objects.select_related("user", "expert", "expert__user").order_by(
            "-created_at"
        )
        paginator = PageNumberPagination()
        page = paginator.paginate_queryset(queryset, request, view=self)
        serializer = AdminBookingSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


class AdminBookingDetailView(APIView):
    """GET /api/v1/admin/bookings/{bookingId}."""

    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(
        operation_id="adminGetBooking",
        tags=["Admin Bookings"],
        responses=AdminBookingSerializer,
    )
    def get(self, request, booking_id):
        booking = _get_booking(booking_id)
        return Response(AdminBookingSerializer(booking).data)


# ── Payments ───────────────────────────────────────────────────────────────────


class AdminPaymentSummaryView(APIView):
    """GET /api/v1/admin/payments/summary."""

    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(operation_id="adminGetPaymentSummary", tags=["Admin Payments"])
    def get(self, request):
        return _NOT_IMPLEMENTED


class AdminPaymentListView(APIView):
    """GET /api/v1/admin/payments."""

    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(operation_id="adminListPayments", tags=["Admin Payments"])
    def get(self, request):
        return _NOT_IMPLEMENTED


class AdminPaymentDetailView(APIView):
    """GET /api/v1/admin/payments/{paymentId}."""

    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(operation_id="adminGetPayment", tags=["Admin Payments"])
    def get(self, request, payment_id):
        return _NOT_IMPLEMENTED


class AdminRefundPaymentView(APIView):
    """POST /api/v1/admin/payments/{paymentId}/refund."""

    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(operation_id="adminRefundPayment", tags=["Admin Payments"])
    def post(self, request, payment_id):
        return _NOT_IMPLEMENTED


# ── Refunds ────────────────────────────────────────────────────────────────────


class AdminRefundListView(APIView):
    """GET /api/v1/admin/refunds."""

    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(operation_id="adminListRefunds", tags=["Admin Refunds"])
    def get(self, request):
        return _NOT_IMPLEMENTED


class AdminRefundDetailView(APIView):
    """GET /api/v1/admin/refunds/{refundId}."""

    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(operation_id="adminGetRefund", tags=["Admin Refunds"])
    def get(self, request, refund_id):
        return _NOT_IMPLEMENTED


class AdminProcessRefundView(APIView):
    """POST /api/v1/admin/refunds/{refundId}/process."""

    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(operation_id="adminProcessRefund", tags=["Admin Refunds"])
    def post(self, request, refund_id):
        return _NOT_IMPLEMENTED


class AdminRejectRefundView(APIView):
    """POST /api/v1/admin/refunds/{refundId}/reject."""

    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(operation_id="adminRejectRefund", tags=["Admin Refunds"])
    def post(self, request, refund_id):
        return _NOT_IMPLEMENTED


# ── Reviews ────────────────────────────────────────────────────────────────────


class AdminReviewListView(APIView):
    """GET /api/v1/admin/reviews."""

    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(operation_id="adminListReviews", tags=["Admin Reviews"])
    def get(self, request):
        return _NOT_IMPLEMENTED


class AdminHideReviewView(APIView):
    """POST /api/v1/admin/reviews/{reviewId}/hide."""

    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(operation_id="adminHideReview", tags=["Admin Reviews"])
    def post(self, request, review_id):
        return _NOT_IMPLEMENTED


class AdminShowReviewView(APIView):
    """POST /api/v1/admin/reviews/{reviewId}/show."""

    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(operation_id="adminShowReview", tags=["Admin Reviews"])
    def post(self, request, review_id):
        return _NOT_IMPLEMENTED


# ── Payouts ────────────────────────────────────────────────────────────────────


class AdminPayoutListView(APIView):
    """GET /api/v1/admin/payouts."""

    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(operation_id="adminListPayouts", tags=["Payouts"])
    def get(self, request):
        return _NOT_IMPLEMENTED


class AdminProcessPayoutView(APIView):
    """POST /api/v1/admin/payouts/{payoutId}/process."""

    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(operation_id="adminProcessPayout", tags=["Payouts"])
    def post(self, request, payout_id):
        return _NOT_IMPLEMENTED


class AdminRejectPayoutView(APIView):
    """POST /api/v1/admin/payouts/{payoutId}/reject."""

    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(operation_id="adminRejectPayout", tags=["Payouts"])
    def post(self, request, payout_id):
        return _NOT_IMPLEMENTED
