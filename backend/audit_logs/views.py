from drf_spectacular.utils import extend_schema
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from common.pagination import PageNumberPagination
from common.permissions import IsAdminUser

from .models import AuditLog
from .serializers import AuditLogSerializer


class AuditLogListView(APIView):
    """GET /api/v1/admin/audit-logs - paginated, immutable audit trail."""

    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(
        operation_id="listAuditLogs",
        tags=["Audit Logs"],
        responses=AuditLogSerializer(many=True),
    )
    def get(self, request):
        queryset = AuditLog.objects.select_related("actor").order_by("-created_at")
        paginator = PageNumberPagination()
        page = paginator.paginate_queryset(queryset, request, view=self)
        serializer = AuditLogSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)
