from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from common.permissions import IsAdminUser

_NOT_IMPLEMENTED = Response({"detail": "Not implemented."}, status=status.HTTP_501_NOT_IMPLEMENTED)


# ── Admin Auth ─────────────────────────────────────────────────────────────────

class AdminAuthSyncView(APIView):
    """POST /api/v1/admin/auth/sync — sync Firebase admin user."""
    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(operation_id="syncAdminUser", tags=["Admin Auth"])
    def post(self, request):
        return _NOT_IMPLEMENTED


class AdminAuthMeView(APIView):
    """GET/PATCH /api/v1/admin/auth/me."""
    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(operation_id="getAdminMe", tags=["Admin Auth"])
    def get(self, request):
        return _NOT_IMPLEMENTED

    @extend_schema(operation_id="updateAdminMe", tags=["Admin Auth"])
    def patch(self, request):
        return _NOT_IMPLEMENTED


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

    @extend_schema(operation_id="adminListApplications", tags=["Admin Applications"])
    def get(self, request):
        return _NOT_IMPLEMENTED


class AdminApplicationDetailView(APIView):
    """GET /api/v1/admin/applications/{applicationId}."""
    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(operation_id="adminGetApplication", tags=["Admin Applications"])
    def get(self, request, application_id):
        return _NOT_IMPLEMENTED


class AdminApproveApplicationView(APIView):
    """POST /api/v1/admin/applications/{applicationId}/approve."""
    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(operation_id="adminApproveApplication", tags=["Admin Applications"])
    def post(self, request, application_id):
        return _NOT_IMPLEMENTED


class AdminRejectApplicationView(APIView):
    """POST /api/v1/admin/applications/{applicationId}/reject."""
    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(operation_id="adminRejectApplication", tags=["Admin Applications"])
    def post(self, request, application_id):
        return _NOT_IMPLEMENTED


class AdminRequestRevisionView(APIView):
    """POST /api/v1/admin/applications/{applicationId}/request-revision."""
    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(operation_id="adminRequestApplicationRevision", tags=["Admin Applications"])
    def post(self, request, application_id):
        return _NOT_IMPLEMENTED


# ── Bookings ───────────────────────────────────────────────────────────────────

class AdminBookingListView(APIView):
    """GET /api/v1/admin/bookings."""
    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(operation_id="adminListBookings", tags=["Admin Bookings"])
    def get(self, request):
        return _NOT_IMPLEMENTED


class AdminBookingDetailView(APIView):
    """GET /api/v1/admin/bookings/{bookingId}."""
    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(operation_id="adminGetBooking", tags=["Admin Bookings"])
    def get(self, request, booking_id):
        return _NOT_IMPLEMENTED


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
