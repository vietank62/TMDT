import uuid

from django.db import models

from common.models import MSSQLUUIDField, SoftDeleteModel, TimeStampedModel, UUIDModel


class Booking(UUIDModel, TimeStampedModel, SoftDeleteModel):
    DRAFT = "DRAFT"
    PENDING_APPROVAL = "PENDING_APPROVAL"
    REJECTED = "REJECTED"
    APPROVED_AWAITING_PAYMENT = "APPROVED_AWAITING_PAYMENT"
    EXPIRED_UNPAID = "EXPIRED_UNPAID"
    PAID_CONFIRMED = "PAID_CONFIRMED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED_BY_USER = "CANCELLED_BY_USER"
    CANCELLED_BY_EXPERT = "CANCELLED_BY_EXPERT"
    NO_SHOW_USER = "NO_SHOW_USER"
    NO_SHOW_EXPERT = "NO_SHOW_EXPERT"
    REFUND_PENDING = "REFUND_PENDING"
    REFUNDED = "REFUNDED"

    STATUS_CHOICES = [
        (DRAFT, "Nháp"),
        (PENDING_APPROVAL, "Chờ chuyên gia xác nhận"),
        (REJECTED, "Bị từ chối"),
        (APPROVED_AWAITING_PAYMENT, "Chờ thanh toán"),
        (EXPIRED_UNPAID, "Hết hạn thanh toán"),
        (PAID_CONFIRMED, "Đã thanh toán"),
        (IN_PROGRESS, "Đang diễn ra"),
        (COMPLETED, "Hoàn thành"),
        (CANCELLED_BY_USER, "Người dùng huỷ"),
        (CANCELLED_BY_EXPERT, "Chuyên gia huỷ"),
        (NO_SHOW_USER, "Người dùng vắng mặt"),
        (NO_SHOW_EXPERT, "Chuyên gia vắng mặt"),
        (REFUND_PENDING, "Chờ hoàn tiền"),
        (REFUNDED, "Đã hoàn tiền"),
    ]

    DURATION_CHOICES = [(30, "30 phút"), (60, "60 phút"), (90, "90 phút")]

    user = models.ForeignKey("users.User", on_delete=models.CASCADE, related_name="bookings")
    expert = models.ForeignKey("experts.Expert", on_delete=models.CASCADE, related_name="bookings")
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default=DRAFT)
    problem_description = models.TextField()
    session_goals = models.TextField()
    document_urls = models.JSONField(default=list)
    scheduled_at = models.DateTimeField(null=True, blank=True)
    duration_minutes = models.IntegerField(choices=DURATION_CHOICES, default=30)
    price_vnd = models.PositiveIntegerField(default=0)  # VND
    expert_response_deadline = models.DateTimeField(null=True, blank=True)
    payment_deadline = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(null=True, blank=True)
    expert_note = models.TextField(null=True, blank=True)
    agora_channel = models.CharField(max_length=255, blank=True)

    class Meta:
        db_table = "bookings"

    def __str__(self) -> str:
        return f"{self.user} → {self.expert} ({self.status})"


class BookingSlot(models.Model):
    id = MSSQLUUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name="booking_slots")
    slot = models.ForeignKey(
        "experts.AvailabilitySlot",
        on_delete=models.CASCADE,
        related_name="booking_slots",
    )

    class Meta:
        db_table = "booking_slots"
        unique_together = [("booking", "slot")]
