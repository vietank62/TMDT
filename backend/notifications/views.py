from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from common.pagination import PageNumberPagination

from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(APIView):
    """GET /api/v1/notifications."""

    permission_classes = [IsAuthenticated]

    @extend_schema(operation_id="listNotifications", tags=["Notifications"])
    def get(self, request):
        queryset = Notification.objects.filter(user=request.user).order_by("-created_at")
        paginator = PageNumberPagination()
        page = paginator.paginate_queryset(queryset, request, view=self)
        serializer = NotificationSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


class MarkNotificationReadView(APIView):
    """POST /api/v1/notifications/{notificationId}/read."""

    permission_classes = [IsAuthenticated]

    @extend_schema(operation_id="markNotificationRead", tags=["Notifications"])
    def post(self, request, notification_id):
        notification = get_object_or_404(Notification, id=notification_id, user=request.user)
        if not notification.is_read:
            notification.is_read = True
            notification.save(update_fields=["is_read"])
        return Response(status=status.HTTP_200_OK)


class MarkAllNotificationsReadView(APIView):
    """POST /api/v1/notifications/read-all."""

    permission_classes = [IsAuthenticated]

    @extend_schema(operation_id="markAllNotificationsRead", tags=["Notifications"])
    def post(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response(status=status.HTTP_200_OK)
