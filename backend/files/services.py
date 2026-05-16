"""Business logic for the file-upload workflow.

Flow:
1. generate_upload_url   — validate → create placeholder DB record → return SAS URL
2. confirm_upload        — verify blob in Azure → mark record confirmed
3. delete_upload         — permission check → delete blob → soft-delete record
"""

from __future__ import annotations

import re
import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from django.conf import settings
from rest_framework.exceptions import (
    NotFound,
    PermissionDenied,
    ValidationError,
)

from files import azure as az
from files.models import UploadedFile

if TYPE_CHECKING:
    from users.models import User

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

ALLOWED_MIME_TYPES: set[str] = {
    "application/pdf",
    "image/png",
    "image/jpeg",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
}

_MAX_SIZE: dict[str, int] = {
    UploadedFile.AVATAR: 5 * 1024 * 1024,  # 5 MB
    UploadedFile.BOOKING_DOCUMENT: 10 * 1024 * 1024,  # 10 MB
    UploadedFile.EXPERT_CERTIFICATE: 20 * 1024 * 1024,
    UploadedFile.PORTFOLIO: 20 * 1024 * 1024,
    UploadedFile.ADMIN_DOCUMENT: 20 * 1024 * 1024,
}

_CATEGORY_FOLDER: dict[str, str] = {
    UploadedFile.AVATAR: "avatars",
    UploadedFile.BOOKING_DOCUMENT: "booking-attachments",
    UploadedFile.EXPERT_CERTIFICATE: "certifications",
    UploadedFile.PORTFOLIO: "portfolio",
    UploadedFile.ADMIN_DOCUMENT: "admin-documents",
}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def get_container_for_category(category: str) -> str:
    if category in UploadedFile.PUBLIC_PURPOSES:
        return settings.AZURE_CONTAINER_PUBLIC
    return settings.AZURE_CONTAINER_PRIVATE


def _slugify_filename(name: str) -> str:
    """Lower-case, replace non-alphanumeric runs with a single hyphen."""
    stem, _, ext = name.rpartition(".")
    slug = re.sub(r"[^a-z0-9]+", "-", stem.lower()).strip("-")
    return f"{slug}.{ext.lower()}" if ext else slug


def _build_blob_path(user_id: str, category: str, original_filename: str) -> str:
    folder = _CATEGORY_FOLDER[category]
    uid = uuid.uuid4().hex
    safe_name = _slugify_filename(original_filename)
    return f"{folder}/{user_id}/{uid}-{safe_name}"


def validate_upload_request(
    filename: str,
    content_type: str,
    size_bytes: int,
    purpose: str,
) -> None:
    """Raise ValidationError for any invalid combination."""
    if not filename:
        raise ValidationError({"filename": "Tên tệp là bắt buộc."})

    if content_type not in ALLOWED_MIME_TYPES:
        raise ValidationError({"content_type": f"Loại tệp không được hỗ trợ: {content_type}."})

    if purpose not in dict(UploadedFile.PURPOSE_CHOICES):
        raise ValidationError({"purpose": f"Danh mục không hợp lệ: {purpose}."})

    if size_bytes <= 0:
        raise ValidationError({"size_bytes": "Kích thước tệp phải lớn hơn 0."})

    max_bytes = _MAX_SIZE.get(purpose, 10 * 1024 * 1024)
    if size_bytes > max_bytes:
        max_mb = max_bytes // (1024 * 1024)
        raise ValidationError({"size_bytes": f"Tệp quá lớn. Kích thước tối đa là {max_mb} MB."})


# ---------------------------------------------------------------------------
# Service functions
# ---------------------------------------------------------------------------


def generate_upload_url(
    user: "User",
    filename: str,
    content_type: str,
    size_bytes: int,
    purpose: str,
) -> dict:
    """
    Validate the request, create an unconfirmed UploadedFile record, and
    return a time-limited SAS upload URL.
    """
    validate_upload_request(filename, content_type, size_bytes, purpose)

    container = get_container_for_category(purpose)
    blob_path = _build_blob_path(str(user.id), purpose, filename)
    stored_name = blob_path.rsplit("/", 1)[-1]

    sas_url, expires_at = az.generate_sas_upload_url(container, blob_path, content_type)

    record = UploadedFile.objects.create(
        uploaded_by=user,
        original_filename=filename,
        stored_name=stored_name,
        blob_path=blob_path,
        blob_url="",  # filled on confirm
        container=container,
        purpose=purpose,
        content_type=content_type,
        size_bytes=size_bytes,
        confirmed=False,
    )

    return {
        "file_id": str(record.id),
        "upload_url": sas_url,
        "blob_path": blob_path,
        "expires_at": expires_at,
        "required_headers": {
            "x-ms-blob-type": "BlockBlob",
            "Content-Type": content_type,
        },
    }


def confirm_upload(
    user: "User",
    file_id: str,
    size_bytes: int,
) -> UploadedFile:
    """
    Verify the blob was uploaded to Azure and mark the record as confirmed.

    Raises:
        NotFound        — if the file_id does not belong to this user.
        ValidationError — if the blob is missing or size mismatches.
    """
    try:
        record = UploadedFile.objects.get(
            id=file_id,
            uploaded_by=user,
            confirmed=False,
            deleted_at__isnull=True,
        )
    except UploadedFile.DoesNotExist:
        raise NotFound("Tệp không tồn tại hoặc đã được xác nhận.")

    if not az.blob_exists(record.container, record.blob_path):
        raise ValidationError({"blob_path": "Tệp chưa được tải lên Azure."})

    actual_size = az.get_blob_size(record.container, record.blob_path)
    if actual_size is not None and abs(actual_size - size_bytes) > 1024:
        raise ValidationError({"size_bytes": "Kích thước tệp không khớp với dữ liệu trên Azure."})

    public_url = az.get_public_url(record.container, record.blob_path) if record.is_public else ""

    record.blob_url = public_url
    record.size_bytes = actual_size or size_bytes
    record.confirmed = True
    record.save(update_fields=["blob_url", "size_bytes", "confirmed"])

    return record


def delete_upload(user: "User", file_id: str) -> None:
    """
    Delete a file.  Only the uploader or a staff/admin user may delete.
    Removes the blob from Azure then soft-deletes the DB record.

    Raises:
        NotFound       — record not found or already deleted.
        PermissionDenied — caller is neither owner nor admin.
    """
    try:
        record = UploadedFile.objects.get(id=file_id, deleted_at__isnull=True)
    except UploadedFile.DoesNotExist:
        raise NotFound("Tệp không tồn tại.")

    if record.uploaded_by_id != user.id and not user.is_staff:
        raise PermissionDenied("Bạn không có quyền xoá tệp này.")

    if record.blob_path and record.container:
        az.delete_blob(record.container, record.blob_path)

    record.soft_delete()
