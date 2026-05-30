from urllib.parse import urlparse

from django.conf import settings
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import OpenApiExample, OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from common.permissions import IsAnyAuthenticatedRole
from files import azure as az
from files import services
from files.models import UploadedFile
from files.serializers import (
    ConfirmUploadRequestSerializer,
    FileUploadSerializer,
    GenerateUploadUrlRequestSerializer,
    GenerateUploadUrlResponseSerializer,
    PrivateDownloadUrlRequestSerializer,
)


class PresignedUrlView(APIView):
    """POST /api/v1/uploads/presigned-url — generate Azure SAS upload URL."""

    permission_classes = [IsAnyAuthenticatedRole]

    @extend_schema(
        operation_id="generatePresignedUrl",
        tags=["File Uploads"],
        request=GenerateUploadUrlRequestSerializer,
        responses={
            200: GenerateUploadUrlResponseSerializer,
            400: OpenApiResponse(description="Validation error (invalid type / size)"),
            401: OpenApiResponse(description="Unauthenticated"),
        },
        examples=[
            OpenApiExample(
                "Booking attachment",
                request_only=True,
                value={
                    "filename": "architecture.pdf",
                    "content_type": "application/pdf",
                    "size_bytes": 5242880,
                    "purpose": "booking_document",
                },
            ),
        ],
    )
    def post(self, request):
        serializer = GenerateUploadUrlRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        result = services.generate_upload_url(
            user=request.user,
            filename=serializer.validated_data["filename"],
            content_type=serializer.validated_data["content_type"],
            size_bytes=serializer.validated_data["size_bytes"],
            purpose=serializer.validated_data["purpose"],
        )

        out = GenerateUploadUrlResponseSerializer(result)
        return Response(out.data, status=status.HTTP_200_OK)


class ConfirmUploadView(APIView):
    """POST /api/v1/uploads/confirm — register completed upload."""

    permission_classes = [IsAnyAuthenticatedRole]

    @extend_schema(
        operation_id="confirmUpload",
        tags=["File Uploads"],
        request=ConfirmUploadRequestSerializer,
        responses={
            201: FileUploadSerializer,
            400: OpenApiResponse(description="Blob not found or size mismatch"),
            401: OpenApiResponse(description="Unauthenticated"),
            404: OpenApiResponse(description="File record not found"),
        },
        examples=[
            OpenApiExample(
                "Confirm attachment",
                request_only=True,
                value={"file_id": "550e8400-e29b-41d4-a716-446655440000", "size_bytes": 5242880},
            ),
        ],
    )
    def post(self, request):
        serializer = ConfirmUploadRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        record = services.confirm_upload(
            user=request.user,
            file_id=str(serializer.validated_data["file_id"]),
            size_bytes=serializer.validated_data["size_bytes"],
        )

        out = FileUploadSerializer(record)
        return Response(out.data, status=status.HTTP_201_CREATED)


class PrivateDownloadUrlView(APIView):
    """POST /api/v1/uploads/download-url — generate a short-lived SAS read URL for a private blob."""

    permission_classes = [IsAnyAuthenticatedRole]

    @extend_schema(
        operation_id="getPrivateDownloadUrl",
        tags=["File Uploads"],
        request=PrivateDownloadUrlRequestSerializer,
        responses={
            200: {"type": "object", "properties": {"download_url": {"type": "string"}}},
            400: OpenApiResponse(description="Invalid URL or not a recognised blob"),
            401: OpenApiResponse(description="Unauthenticated"),
        },
    )
    def post(self, request):
        serializer = PrivateDownloadUrlRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        blob_url: str = serializer.validated_data["blob_url"]

        # Parse container + blob_path from canonical Azure blob URL.
        # Expected format: https://{account}.blob.core.windows.net/{container}/{blob_path}
        parsed = urlparse(blob_url)
        account_host = f"{settings.AZURE_ACCOUNT_NAME}.blob.core.windows.net"
        if parsed.netloc != account_host:
            return Response(
                {"detail": "URL does not belong to the configured Azure account."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        path_parts = parsed.path.lstrip("/").split("/", 1)
        if len(path_parts) != 2:
            return Response({"detail": "Cannot resolve blob path from URL."}, status=status.HTTP_400_BAD_REQUEST)

        container, blob_path = path_parts

        sas_url = az.generate_sas_read_url(container, blob_path)
        return Response({"download_url": sas_url})


class UploadDeleteView(APIView):
    """DELETE /api/v1/uploads/{fileId}."""

    permission_classes = [IsAnyAuthenticatedRole]

    @extend_schema(
        operation_id="deleteUpload",
        tags=["File Uploads"],
        responses={
            204: OpenApiResponse(description="Deleted"),
            401: OpenApiResponse(description="Unauthenticated"),
            403: OpenApiResponse(description="Not the owner or admin"),
            404: OpenApiResponse(description="File not found"),
        },
    )
    def delete(self, request, file_id):
        services.delete_upload(user=request.user, file_id=str(file_id))
        return Response(status=status.HTTP_204_NO_CONTENT)
