from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from common.permissions import IsAdminUser

_NOT_IMPLEMENTED = Response({"detail": "Not implemented."}, status=status.HTTP_501_NOT_IMPLEMENTED)


class AuditLogListView(APIView):
    """GET /api/v1/admin/audit-logs — paginated, immutable audit trail."""

    permission_classes = [IsAuthenticated, IsAdminUser]

    @extend_schema(operation_id="listAuditLogs", tags=["Audit Logs"])
    def get(self, request):
        return _NOT_IMPLEMENTED
