from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

_NOT_IMPLEMENTED = Response({"detail": "Not implemented."}, status=status.HTTP_501_NOT_IMPLEMENTED)


class BookingListCreateView(APIView):
    """GET/POST /api/v1/bookings."""
    permission_classes = [IsAuthenticated]

    @extend_schema(operation_id="listMyBookings", tags=["Bookings"])
    def get(self, request):
        return _NOT_IMPLEMENTED

    @extend_schema(operation_id="createBooking", tags=["Bookings"])
    def post(self, request):
        return _NOT_IMPLEMENTED


class BookingDetailView(APIView):
    """GET /api/v1/bookings/{bookingId}."""
    permission_classes = [IsAuthenticated]

    @extend_schema(operation_id="getBooking", tags=["Bookings"])
    def get(self, request, booking_id):
        return _NOT_IMPLEMENTED


class BookingApproveView(APIView):
    """POST /api/v1/bookings/{bookingId}/approve."""
    permission_classes = [IsAuthenticated]

    @extend_schema(operation_id="approveBooking", tags=["Bookings"])
    def post(self, request, booking_id):
        return _NOT_IMPLEMENTED


class BookingRejectView(APIView):
    """POST /api/v1/bookings/{bookingId}/reject."""
    permission_classes = [IsAuthenticated]

    @extend_schema(operation_id="rejectBooking", tags=["Bookings"])
    def post(self, request, booking_id):
        return _NOT_IMPLEMENTED


class BookingCancelView(APIView):
    """POST /api/v1/bookings/{bookingId}/cancel."""
    permission_classes = [IsAuthenticated]

    @extend_schema(operation_id="cancelBooking", tags=["Bookings"])
    def post(self, request, booking_id):
        return _NOT_IMPLEMENTED


class BookingCompleteView(APIView):
    """POST /api/v1/bookings/{bookingId}/complete."""
    permission_classes = [IsAuthenticated]

    @extend_schema(operation_id="completeBooking", tags=["Bookings"])
    def post(self, request, booking_id):
        return _NOT_IMPLEMENTED


class BookingSessionTokenView(APIView):
    """POST /api/v1/bookings/{bookingId}/session-token — Agora RTC token."""
    permission_classes = [IsAuthenticated]

    @extend_schema(operation_id="getSessionToken", tags=["Bookings"])
    def post(self, request, booking_id):
        return _NOT_IMPLEMENTED
