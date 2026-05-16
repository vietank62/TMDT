from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

_NOT_IMPLEMENTED = Response({"detail": "Not implemented."}, status=status.HTTP_501_NOT_IMPLEMENTED)


# ── Payments ───────────────────────────────────────────────────────────────────


class PaymentListView(APIView):
    """GET /api/v1/payments — list current user's payments."""

    permission_classes = [IsAuthenticated]

    @extend_schema(operation_id="listMyPayments", tags=["Payments"])
    def get(self, request):
        return _NOT_IMPLEMENTED


class PaymentOrderCreateView(APIView):
    """POST /api/v1/payments/bookings/{bookingId} — create SEPay order."""

    permission_classes = [IsAuthenticated]

    @extend_schema(operation_id="createPaymentOrder", tags=["Payments"])
    def post(self, request, booking_id):
        return _NOT_IMPLEMENTED


class PaymentDetailView(APIView):
    """GET /api/v1/payments/{paymentId}."""

    permission_classes = [IsAuthenticated]

    @extend_schema(operation_id="getPayment", tags=["Payments"])
    def get(self, request, payment_id):
        return _NOT_IMPLEMENTED


class SEPayWebhookView(APIView):
    """POST /api/v1/payments/webhook/sepay — HMAC-verified, no auth."""

    permission_classes = [AllowAny]
    authentication_classes = []

    @extend_schema(operation_id="handleSepayWebhook", tags=["Payments"])
    def post(self, request):
        return _NOT_IMPLEMENTED


# ── Refunds ────────────────────────────────────────────────────────────────────


class RefundByBookingView(APIView):
    """GET /api/v1/refunds/bookings/{bookingId}."""

    permission_classes = [IsAuthenticated]

    @extend_schema(operation_id="getRefundByBooking", tags=["Refunds"])
    def get(self, request, booking_id):
        return _NOT_IMPLEMENTED
