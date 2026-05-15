from django.db import models

from common.models import TimeStampedModel, UUIDModel


class Payment(UUIDModel, TimeStampedModel):
    PENDING = "PENDING"
    PAID = "PAID"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"

    STATUS_CHOICES = [
        (PENDING, "Chờ thanh toán"),
        (PAID, "Đã thanh toán"),
        (FAILED, "Thất bại"),
        (REFUNDED, "Đã hoàn tiền"),
    ]

    booking = models.OneToOneField(
        "bookings.Booking", on_delete=models.CASCADE, related_name="payment"
    )
    user = models.ForeignKey(
        "users.User", on_delete=models.CASCADE, related_name="payments"
    )
    expert = models.ForeignKey(
        "experts.Expert", on_delete=models.CASCADE, related_name="payments"
    )
    amount = models.PositiveIntegerField()              # VND
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PENDING)
    sepay_order_id = models.CharField(max_length=255, blank=True)
    sepay_transaction_id = models.CharField(max_length=255, blank=True)
    sepay_qr_code = models.TextField(null=True, blank=True)
    bank_account = models.JSONField(null=True, blank=True)
    transfer_code = models.CharField(max_length=100, null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    refund_amount = models.PositiveIntegerField(default=0)  # VND
    refunded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "payments"

    def __str__(self) -> str:
        return f"{self.booking_id} — {self.status}"


class Payout(UUIDModel):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    PAID = "PAID"

    STATUS_CHOICES = [
        (PENDING, "Chờ xử lý"),
        (APPROVED, "Đã duyệt"),
        (REJECTED, "Từ chối"),
        (PAID, "Đã thanh toán"),
    ]

    expert = models.ForeignKey(
        "experts.Expert", on_delete=models.CASCADE, related_name="payouts"
    )
    amount = models.PositiveIntegerField()              # VND
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PENDING)
    bank_account = models.JSONField(default=dict)
    admin_note = models.TextField(null=True, blank=True)
    requested_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "payouts"

    def __str__(self) -> str:
        return f"{self.expert_id} — {self.amount} VND ({self.status})"
