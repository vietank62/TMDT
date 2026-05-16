from django.db import models
from django.utils import timezone

from common.models import UUIDModel


class UploadedFile(UUIDModel):
    AVATAR = "avatar"
    BOOKING_DOCUMENT = "booking_document"
    EXPERT_CERTIFICATE = "expert_certificate"
    PORTFOLIO = "portfolio"
    ADMIN_DOCUMENT = "admin_document"

    PURPOSE_CHOICES = [
        (AVATAR, "Ảnh đại diện"),
        (BOOKING_DOCUMENT, "Tài liệu đặt lịch"),
        (EXPERT_CERTIFICATE, "Chứng chỉ chuyên gia"),
        (PORTFOLIO, "Danh mục đầu tư"),
        (ADMIN_DOCUMENT, "Tài liệu quản trị"),
    ]

    # Public categories are served without authentication.
    PUBLIC_PURPOSES = {AVATAR, PORTFOLIO}

    uploaded_by = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        related_name="uploaded_files",
        db_column="uploaded_by",
    )
    original_filename = models.CharField(max_length=255)
    stored_name = models.CharField(max_length=512, blank=True)
    blob_path = models.CharField(max_length=1024, blank=True)
    blob_url = models.URLField(max_length=2048, blank=True)
    container = models.CharField(max_length=100, blank=True)
    purpose = models.CharField(max_length=50, choices=PURPOSE_CHOICES)
    content_type = models.CharField(max_length=100, blank=True)
    size_bytes = models.BigIntegerField(default=0)
    checksum = models.CharField(max_length=64, blank=True)
    confirmed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    objects = models.Manager()

    class Meta:
        db_table = "uploaded_files"
        indexes = [
            models.Index(fields=["uploaded_by", "confirmed"]),
            models.Index(fields=["blob_path"]),
        ]

    def __str__(self) -> str:
        return self.original_filename

    @property
    def is_public(self) -> bool:
        return self.purpose in self.PUBLIC_PURPOSES

    def soft_delete(self) -> None:
        self.deleted_at = timezone.now()
        self.save(update_fields=["deleted_at"])
