from django.contrib.auth import get_user_model
from django.db.models import Count, Q, Sum
from django.db.models.functions import TruncMonth
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
from payments.models import Payment, Payout
from reviews.models import Review

from .serializers import (
    AdminApplicationActionSerializer,
    AdminApplicationSerializer,
    AdminBookingSerializer,
    AdminDashboardSerializer,
    AdminExpertSerializer,
    AdminPaymentRefundSerializer,
    AdminPaymentSerializer,
    AdminPaymentSummarySerializer,
    AdminPayoutActionSerializer,
    AdminPayoutSerializer,
    AdminRefundActionSerializer,
    AdminRefundSerializer,
    AdminReviewSerializer,
    AdminSerializer,
    AdminUpdateSerializer,
    AdminUserSerializer,
    AdminUserUpdateSerializer,
)

_NOT_IMPLEMENTED = Response(
    {"detail": "Not implemented."}, status=status.HTTP_501_NOT_IMPLEMENTED
)
User = get_user_model()


def _month_start(value):
    return value.replace(day=1, hour=0, minute=0, second=0, microsecond=0)


def _shift_month(value, months):
    month_index = value.month - 1 + months
    year = value.year + month_index // 12
    month = month_index % 12 + 1
    return value.replace(year=year, month=month)


def _build_monthly_revenue():
    current_month = _month_start(timezone.now())
    first_month = _shift_month(current_month, -5)
    monthly_totals = {
        row["month"].date(): row["total"] or 0
        for row in (
            Payment.objects.filter(status=Payment.PAID, paid_at__gte=first_month)
            .annotate(month=TruncMonth("paid_at"))
            .values("month")
            .annotate(total=Sum("amount"))
        )
        if row["month"]
    }

    return [
        {
            "month": month.strftime("%Y-%m"),
            "revenue": monthly_totals.get(month.date(), 0),
        }
        for month in (_shift_month(first_month, offset) for offset in range(6))
    ]


def _build_booking_status_breakdown():
    counts = {
        row["status"]: row["count"]
        for row in Booking.objects.values("status").annotate(count=Count("id"))
    }
    return [
        {"status": status_code, "count": counts.get(status_code, 0)}
        for status_code, _ in Booking.STATUS_CHOICES
    ]


def _get_application(application_id):
    return get_object_or_404(Expert.objects.select_related("user"), id=application_id)


def _get_user(user_id):
    return get_object_or_404(User, id=user_id)


def _get_expert(expert_id):
    return get_object_or_404(Expert.objects.select_related("user"), id=expert_id)


def _get_booking(booking_id):
    return get_object_or_404(
        Booking.objects.select_related("user", "expert", "expert__user"),
        id=booking_id,
    )


def _get_payment(payment_id):
    return get_object_or_404(
        Payment.objects.select_related("booking", "user", "expert", "expert__user"),
        id=payment_id,
    )


def _get_refund(refund_id):
    return get_object_or_404(
        Payment.objects.select_related(
            "booking", "user", "expert", "expert__user"
        ).filter(
            Q(booking__status=Booking.REFUND_PENDING)
            | Q(booking__status=Booking.REFUNDED)
            | Q(status=Payment.REFUNDED)
            | Q(refund_amount__gt=0)
        ),
        id=refund_id,
    )


def _get_review(review_id):
    return get_object_or_404(
        Review.objects.select_related("booking", "reviewer", "expert", "expert__user"),
        id=review_id,
    )


def _get_payout(payout_id):
    return get_object_or_404(
        Payout.objects.select_related("expert", "expert__user"), id=payout_id
    )


def _update_application_status(request, application_id, profile_status):
    serializer = AdminApplicationActionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    application = _get_application(application_id)
    application.profile_status = profile_status
    application.reviewed_at = timezone.now()

    if "admin_note" in serializer.validated_data:
        application.admin_note = serializer.validated_data["admin_note"]

    application.save(
        update_fields=["profile_status", "reviewed_at", "admin_note", "updated_at"]
    )
    return Response(AdminApplicationSerializer(application).data)


def _update_expert_profile_status(request, expert_id, profile_status):
    serializer = AdminApplicationActionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    expert = _get_expert(expert_id)
    expert.profile_status = profile_status
    expert.reviewed_at = timezone.now()

    if "admin_note" in serializer.validated_data:
        expert.admin_note = serializer.validated_data["admin_note"]

    expert.save(
        update_fields=["profile_status", "reviewed_at", "admin_note", "updated_at"]
    )
    return Response(AdminExpertSerializer(expert).data)


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

    @extend_schema(
        operation_id="syncAdminUser", tags=["Admin Auth"], responses=AdminSerializer
    )
    def post(self, request):
        if not request.user.is_staff and not _has_admin_claim(request):
            return Response(
                {"detail": "Admin privileges are required."},
                status=status.HTTP_403_FORBIDDEN,
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

    @extend_schema(
        operation_id="getAdminMe", tags=["Admin Auth"], responses=AdminSerializer
    )
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

    @extend_schema(
        operation_id="getAdminDashboard",
        tags=["Admin Dashboard"],
        responses=AdminDashboardSerializer,
    )
    def get(self, request):
        active_statuses = [
            Booking.PENDING_APPROVAL,
            Booking.APPROVED_AWAITING_PAYMENT,
            Booking.PAID_CONFIRMED,
            Booking.IN_PROGRESS,
        ]
        total_revenue = (
            Payment.objects.filter(status=Payment.PAID).aggregate(total=Sum("amount"))[
                "total"
            ]
            or 0
        )
        data = {
            "total_users": User.objects.count(),
            "total_experts": Expert.objects.count(),
            "total_bookings": Booking.objects.count(),
            "total_revenue": total_revenue,
            "pending_applications": Expert.objects.filter(
                profile_status=Expert.PENDING_REVIEW
            ).count(),
            "active_bookings": Booking.objects.filter(
                status__in=active_statuses
            ).count(),
            "monthly_revenue": _build_monthly_revenue(),
            "booking_status_breakdown": _build_booking_status_breakdown(),
        }
        return Response(AdminDashboardSerializer(data).data)


# ── Users ──────────────────────────────────────────────────────────────────────


class AdminUserListView(APIView):
    """GET /api/v1/admin/users."""

    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(
        operation_id="adminListUsers",
        tags=["Admin Users"],
        responses=AdminUserSerializer(many=True),
    )
    def get(self, request):
        queryset = User.objects.order_by("-created_at")
        paginator = PageNumberPagination()
        page = paginator.paginate_queryset(queryset, request, view=self)
        serializer = AdminUserSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


class AdminUserDetailView(APIView):
    """GET/PATCH /api/v1/admin/users/{userId}."""

    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(
        operation_id="adminGetUser",
        tags=["Admin Users"],
        responses=AdminUserSerializer,
    )
    def get(self, request, user_id):
        user = _get_user(user_id)
        return Response(AdminUserSerializer(user).data)

    @extend_schema(
        operation_id="adminUpdateUser",
        tags=["Admin Users"],
        request=AdminUserUpdateSerializer,
        responses=AdminUserSerializer,
    )
    def patch(self, request, user_id):
        user = _get_user(user_id)
        serializer = AdminUserUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        update_fields = []
        for field, value in serializer.validated_data.items():
            setattr(user, field, value)
            update_fields.append(field)

        if update_fields:
            user.save(update_fields=update_fields)

        return Response(AdminUserSerializer(user).data)


# ── Experts ────────────────────────────────────────────────────────────────────


class AdminExpertListView(APIView):
    """GET /api/v1/admin/experts."""

    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(
        operation_id="adminListExperts",
        tags=["Admin Experts"],
        responses=AdminExpertSerializer(many=True),
    )
    def get(self, request):
        queryset = Expert.objects.select_related("user").order_by("-created_at")
        paginator = PageNumberPagination()
        page = paginator.paginate_queryset(queryset, request, view=self)
        serializer = AdminExpertSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


class AdminExpertDetailView(APIView):
    """GET /api/v1/admin/experts/{expertId}."""

    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(
        operation_id="adminGetExpert",
        tags=["Admin Experts"],
        responses=AdminExpertSerializer,
    )
    def get(self, request, expert_id):
        expert = _get_expert(expert_id)
        return Response(AdminExpertSerializer(expert).data)


class AdminApproveExpertProfileView(APIView):
    """POST /api/v1/admin/experts/{expertId}/approve-profile."""

    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(
        operation_id="adminApproveExpertProfile",
        tags=["Admin Experts"],
        request=AdminApplicationActionSerializer,
        responses=AdminExpertSerializer,
    )
    def post(self, request, expert_id):
        return _update_expert_profile_status(request, expert_id, Expert.APPROVED)


class AdminRejectExpertProfileView(APIView):
    """POST /api/v1/admin/experts/{expertId}/reject-profile."""

    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(
        operation_id="adminRejectExpertProfile",
        tags=["Admin Experts"],
        request=AdminApplicationActionSerializer,
        responses=AdminExpertSerializer,
    )
    def post(self, request, expert_id):
        return _update_expert_profile_status(request, expert_id, Expert.REJECTED)


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
        return _update_application_status(
            request, application_id, Expert.NEEDS_REVISION
        )


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
        queryset = Booking.objects.select_related(
            "user", "expert", "expert__user"
        ).order_by("-created_at")
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

    @extend_schema(
        operation_id="adminGetPaymentSummary",
        tags=["Admin Payments"],
        responses=AdminPaymentSummarySerializer,
    )
    def get(self, request):
        totals = Payment.objects.values("status").annotate(total=Sum("amount"))
        by_status = {row["status"]: row["total"] or 0 for row in totals}
        refunded_amount = (
            Payment.objects.filter(status=Payment.REFUNDED).aggregate(
                total=Sum("refund_amount")
            )["total"]
            or 0
        )
        data = {
            "total_collected": by_status.get(Payment.PAID, 0),
            "pending_amount": by_status.get(Payment.PENDING, 0),
            "refunded_amount": refunded_amount,
            "failed_amount": by_status.get(Payment.FAILED, 0),
        }
        return Response(AdminPaymentSummarySerializer(data).data)


class AdminPaymentListView(APIView):
    """GET /api/v1/admin/payments."""

    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(
        operation_id="adminListPayments",
        tags=["Admin Payments"],
        responses=AdminPaymentSerializer(many=True),
    )
    def get(self, request):
        queryset = Payment.objects.select_related(
            "booking", "user", "expert", "expert__user"
        ).order_by("-created_at")
        paginator = PageNumberPagination()
        page = paginator.paginate_queryset(queryset, request, view=self)
        serializer = AdminPaymentSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


class AdminPaymentDetailView(APIView):
    """GET /api/v1/admin/payments/{paymentId}."""

    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(
        operation_id="adminGetPayment",
        tags=["Admin Payments"],
        responses=AdminPaymentSerializer,
    )
    def get(self, request, payment_id):
        payment = _get_payment(payment_id)
        return Response(AdminPaymentSerializer(payment).data)


class AdminRefundPaymentView(APIView):
    """POST /api/v1/admin/payments/{paymentId}/refund."""

    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(
        operation_id="adminRefundPayment",
        tags=["Admin Payments"],
        request=AdminPaymentRefundSerializer,
        responses=AdminPaymentSerializer,
    )
    def post(self, request, payment_id):
        serializer = AdminPaymentRefundSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        payment = _get_payment(payment_id)
        if payment.status == Payment.REFUNDED:
            return Response(AdminPaymentSerializer(payment).data)

        if payment.status != Payment.PAID:
            return Response(
                {"detail": "Only paid payments can be refunded."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        refund_amount = serializer.validated_data.get("amount", payment.amount)
        if refund_amount > payment.amount:
            return Response(
                {"amount": ["Refund amount cannot exceed payment amount."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        payment.status = Payment.REFUNDED
        payment.refund_amount = refund_amount
        payment.refunded_at = timezone.now()
        payment.save(
            update_fields=["status", "refund_amount", "refunded_at", "updated_at"]
        )

        booking = payment.booking
        booking.status = Booking.REFUNDED
        booking.save(update_fields=["status", "updated_at"])

        return Response(AdminPaymentSerializer(payment).data)


# ── Refunds ────────────────────────────────────────────────────────────────────


class AdminRefundListView(APIView):
    """GET /api/v1/admin/refunds."""

    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(
        operation_id="adminListRefunds",
        tags=["Admin Refunds"],
        responses=AdminRefundSerializer(many=True),
    )
    def get(self, request):
        queryset = (
            Payment.objects.select_related("booking", "user", "expert", "expert__user")
            .filter(
                Q(booking__status=Booking.REFUND_PENDING)
                | Q(booking__status=Booking.REFUNDED)
                | Q(status=Payment.REFUNDED)
                | Q(refund_amount__gt=0)
            )
            .order_by("-updated_at")
        )
        paginator = PageNumberPagination()
        page = paginator.paginate_queryset(queryset, request, view=self)
        serializer = AdminRefundSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


class AdminRefundDetailView(APIView):
    """GET /api/v1/admin/refunds/{refundId}."""

    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(
        operation_id="adminGetRefund",
        tags=["Admin Refunds"],
        responses=AdminRefundSerializer,
    )
    def get(self, request, refund_id):
        refund = _get_refund(refund_id)
        return Response(AdminRefundSerializer(refund).data)


class AdminProcessRefundView(APIView):
    """POST /api/v1/admin/refunds/{refundId}/process."""

    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(
        operation_id="adminProcessRefund",
        tags=["Admin Refunds"],
        request=AdminRefundActionSerializer,
        responses=AdminRefundSerializer,
    )
    def post(self, request, refund_id):
        serializer = AdminRefundActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        refund = _get_refund(refund_id)
        if refund.status == Payment.REFUNDED:
            return Response(AdminRefundSerializer(refund).data)

        if refund.status != Payment.PAID:
            return Response(
                {"detail": "Only paid payments can be refunded."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        refund.status = Payment.REFUNDED
        refund.refund_amount = refund.refund_amount or refund.amount
        refund.refunded_at = timezone.now()
        refund.save(
            update_fields=["status", "refund_amount", "refunded_at", "updated_at"]
        )

        booking = refund.booking
        booking.status = Booking.REFUNDED
        booking.save(update_fields=["status", "updated_at"])

        return Response(AdminRefundSerializer(refund).data)


class AdminRejectRefundView(APIView):
    """POST /api/v1/admin/refunds/{refundId}/reject."""

    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(
        operation_id="adminRejectRefund",
        tags=["Admin Refunds"],
        request=AdminRefundActionSerializer,
        responses=AdminRefundSerializer,
    )
    def post(self, request, refund_id):
        serializer = AdminRefundActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        refund = _get_refund(refund_id)
        if refund.status == Payment.REFUNDED:
            return Response(
                {"detail": "Processed refunds cannot be rejected."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        booking = refund.booking
        booking.status = Booking.PAID_CONFIRMED
        booking.save(update_fields=["status", "updated_at"])

        data = AdminRefundSerializer(refund).data
        data["status"] = "REJECTED"
        data["booking_status"] = booking.status
        data["admin_note"] = serializer.validated_data.get("admin_note")
        return Response(data)


# ── Reviews ────────────────────────────────────────────────────────────────────


class AdminReviewListView(APIView):
    """GET /api/v1/admin/reviews."""

    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(
        operation_id="adminListReviews",
        tags=["Admin Reviews"],
        responses=AdminReviewSerializer(many=True),
    )
    def get(self, request):
        queryset = Review.objects.select_related(
            "booking", "reviewer", "expert", "expert__user"
        ).order_by("-created_at")
        paginator = PageNumberPagination()
        page = paginator.paginate_queryset(queryset, request, view=self)
        serializer = AdminReviewSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


class AdminHideReviewView(APIView):
    """POST /api/v1/admin/reviews/{reviewId}/hide."""

    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(
        operation_id="adminHideReview",
        tags=["Admin Reviews"],
        responses=AdminReviewSerializer,
    )
    def post(self, request, review_id):
        review = _get_review(review_id)
        review.is_public = False
        review.save(update_fields=["is_public", "updated_at"])
        return Response(AdminReviewSerializer(review).data)


class AdminShowReviewView(APIView):
    """POST /api/v1/admin/reviews/{reviewId}/show."""

    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(
        operation_id="adminShowReview",
        tags=["Admin Reviews"],
        responses=AdminReviewSerializer,
    )
    def post(self, request, review_id):
        review = _get_review(review_id)
        review.is_public = True
        review.save(update_fields=["is_public", "updated_at"])
        return Response(AdminReviewSerializer(review).data)


# ── Payouts ────────────────────────────────────────────────────────────────────


class AdminPayoutListView(APIView):
    """GET /api/v1/admin/payouts."""

    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(
        operation_id="adminListPayouts",
        tags=["Payouts"],
        responses=AdminPayoutSerializer(many=True),
    )
    def get(self, request):
        queryset = Payout.objects.select_related("expert", "expert__user").order_by(
            "-requested_at"
        )
        paginator = PageNumberPagination()
        page = paginator.paginate_queryset(queryset, request, view=self)
        serializer = AdminPayoutSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


class AdminProcessPayoutView(APIView):
    """POST /api/v1/admin/payouts/{payoutId}/process."""

    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(
        operation_id="adminProcessPayout",
        tags=["Payouts"],
        request=AdminPayoutActionSerializer,
        responses=AdminPayoutSerializer,
    )
    def post(self, request, payout_id):
        serializer = AdminPayoutActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        payout = _get_payout(payout_id)
        if payout.status == Payout.PAID:
            return Response(AdminPayoutSerializer(payout).data)
        if payout.status == Payout.REJECTED:
            return Response(
                {"detail": "Rejected payouts cannot be processed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        payout.status = Payout.PAID
        payout.processed_at = timezone.now()
        if "admin_note" in serializer.validated_data:
            payout.admin_note = serializer.validated_data["admin_note"]
        payout.save(update_fields=["status", "processed_at", "admin_note"])

        expert = payout.expert
        expert.pending_balance = max(expert.pending_balance - payout.amount, 0)
        expert.save(update_fields=["pending_balance", "updated_at"])

        return Response(AdminPayoutSerializer(payout).data)


class AdminRejectPayoutView(APIView):
    """POST /api/v1/admin/payouts/{payoutId}/reject."""

    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(
        operation_id="adminRejectPayout",
        tags=["Payouts"],
        request=AdminPayoutActionSerializer,
        responses=AdminPayoutSerializer,
    )
    def post(self, request, payout_id):
        serializer = AdminPayoutActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        payout = _get_payout(payout_id)
        if payout.status == Payout.PAID:
            return Response(
                {"detail": "Paid payouts cannot be rejected."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        payout.status = Payout.REJECTED
        payout.processed_at = timezone.now()
        if "admin_note" in serializer.validated_data:
            payout.admin_note = serializer.validated_data["admin_note"]
        payout.save(update_fields=["status", "processed_at", "admin_note"])

        return Response(AdminPayoutSerializer(payout).data)
