from django.db import models

from common.models import UUIDModel


class AuditLog(UUIDModel):
    ROLE_USER = "user"
    ROLE_EXPERT = "expert"
    ROLE_ADMIN = "admin"
    ROLE_SYSTEM = "system"

    ACTOR_ROLE_CHOICES = [
        (ROLE_USER, "Người dùng"),
        (ROLE_EXPERT, "Chuyên gia"),
        (ROLE_ADMIN, "Quản trị viên"),
        (ROLE_SYSTEM, "Hệ thống"),
    ]

    actor = models.ForeignKey(
        "users.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="audit_logs",
    )
    actor_role = models.CharField(max_length=20, choices=ACTOR_ROLE_CHOICES, blank=True)
    action = models.CharField(max_length=100)
    target_type = models.CharField(max_length=100)
    target_id = models.CharField(max_length=36)     # UUID stored as string
    previous_state = models.JSONField(null=True, blank=True)
    new_state = models.JSONField(null=True, blank=True)
    note = models.TextField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "audit_logs"
        indexes = [
            models.Index(fields=["target_type", "target_id"]),
            models.Index(fields=["actor"]),
        ]

    def __str__(self) -> str:
        return f"{self.actor_role} — {self.action} on {self.target_type}:{self.target_id}"
