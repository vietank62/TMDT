from rest_framework.permissions import BasePermission

from files.models import UploadedFile


class IsFileOwnerOrAdmin(BasePermission):
    """Allow access only to the file's uploader or a staff/admin user."""

    message = "Bạn không có quyền thực hiện thao tác này."

    def has_object_permission(self, request, view, obj: UploadedFile) -> bool:
        if request.user and request.user.is_staff:
            return True
        return obj.uploaded_by_id == request.user.id
