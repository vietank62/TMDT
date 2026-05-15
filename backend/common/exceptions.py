import logging

from django.core.exceptions import PermissionDenied
from django.http import Http404
from rest_framework import status
from rest_framework.exceptions import APIException, ValidationError
from rest_framework.response import Response
from rest_framework.views import exception_handler

logger = logging.getLogger("micromentor")


def custom_exception_handler(exc, context):
    """Return a consistent error envelope: {detail, code, errors?}."""
    response = exception_handler(exc, context)

    if response is None:
        if isinstance(exc, Http404):
            response = Response(
                {"detail": "Không tìm thấy.", "code": "not_found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        elif isinstance(exc, PermissionDenied):
            response = Response(
                {"detail": "Không có quyền truy cập.", "code": "permission_denied"},
                status=status.HTTP_403_FORBIDDEN,
            )
        else:
            logger.exception("Unhandled exception", exc_info=exc)
            response = Response(
                {"detail": "Lỗi máy chủ nội bộ.", "code": "server_error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        return response

    if isinstance(exc, ValidationError):
        response.data = {
            "detail": "Dữ liệu không hợp lệ.",
            "code": "validation_error",
            "errors": response.data,
        }

    return response


class ServiceError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Yêu cầu không hợp lệ."
    default_code = "service_error"


class ConflictError(APIException):
    status_code = status.HTTP_409_CONFLICT
    default_detail = "Xung đột dữ liệu."
    default_code = "conflict"
