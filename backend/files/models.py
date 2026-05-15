from django.db import models

from common.models import UUIDModel


class UploadedFile(UUIDModel):
    BOOKING_DOCUMENT = "booking_document"
    EXPERT_CERTIFICATE = "expert_certificate"
    AVATAR = "avatar"

    PURPOSE_CHOICES = [
        (BOOKING_DOCUMENT, "Tài liệu đặt lịch"),
        (EXPERT_CERTIFICATE, "Chứng chỉ chuyên gia"),
        (AVATAR, "Ảnh đại diện"),
    ]

    uploaded_by = models.ForeignKey(
        "users.User", on_delete=models.CASCADE, related_name="uploaded_files"
    )
    original_filename = models.CharField(max_length=255)
    blob_url = models.URLField(max_length=500)
    container = models.CharField(max_length=50, default="private")
    purpose = models.CharField(max_length=50, choices=PURPOSE_CHOICES)
    content_type = models.CharField(max_length=100, blank=True)
    size_bytes = models.BigIntegerField(default=0)
    confirmed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "uploaded_files"

    def __str__(self) -> str:
        return self.original_filename
