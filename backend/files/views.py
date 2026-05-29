from drf_spectacular.utils import OpenApiExample, OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from common.permissions import IsAnyAuthenticatedRole
from files import services
from files.serializers import (
    ConfirmUploadRequestSerializer,
    FileUploadSerializer,
    GenerateUploadUrlRequestSerializer,
    GenerateUploadUrlResponseSerializer,
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
