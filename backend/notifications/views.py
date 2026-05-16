from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

_NOT_IMPLEMENTED = Response({"detail": "Not implemented."}, status=status.HTTP_501_NOT_IMPLEMENTED)


class NotificationListView(APIView):
    """GET /api/v1/notifications."""

    permission_classes = [IsAuthenticated]

    @extend_schema(operation_id="listNotifications", tags=["Notifications"])
    def get(self, request):
        return _NOT_IMPLEMENTED


class MarkNotificationReadView(APIView):
    """POST /api/v1/notifications/{notificationId}/read."""

    permission_classes = [IsAuthenticated]

    @extend_schema(operation_id="markNotificationRead", tags=["Notifications"])
    def post(self, request, notification_id):
        return _NOT_IMPLEMENTED


class MarkAllNotificationsReadView(APIView):
    """POST /api/v1/notifications/read-all."""

    permission_classes = [IsAuthenticated]

    @extend_schema(operation_id="markAllNotificationsRead", tags=["Notifications"])
    def post(self, request):
        return _NOT_IMPLEMENTED
