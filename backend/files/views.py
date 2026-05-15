from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

_NOT_IMPLEMENTED = Response({"detail": "Not implemented."}, status=status.HTTP_501_NOT_IMPLEMENTED)


class PresignedUrlView(APIView):
    """POST /api/v1/uploads/presigned-url — generate Azure SAS upload URL."""
    permission_classes = [IsAuthenticated]

    @extend_schema(operation_id="generatePresignedUrl", tags=["File Uploads"])
    def post(self, request):
        return _NOT_IMPLEMENTED


class ConfirmUploadView(APIView):
    """POST /api/v1/uploads/confirm — register completed upload."""
    permission_classes = [IsAuthenticated]

    @extend_schema(operation_id="confirmUpload", tags=["File Uploads"])
    def post(self, request):
        return _NOT_IMPLEMENTED


class UploadDeleteView(APIView):
    """DELETE /api/v1/uploads/{fileId}."""
    permission_classes = [IsAuthenticated]

    @extend_schema(operation_id="deleteUpload", tags=["File Uploads"])
    def delete(self, request, file_id):
        return Response(status=status.HTTP_501_NOT_IMPLEMENTED)
