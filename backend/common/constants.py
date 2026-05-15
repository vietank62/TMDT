from django.db import models


class BookingStatus(models.TextChoices):
    DRAFT = "DRAFT", "Nháp"
    PENDING_APPROVAL = "PENDING_APPROVAL", "Chờ chuyên gia duyệt"
    REJECTED = "REJECTED", "Bị từ chối"
    APPROVED_AWAITING_PAYMENT = "APPROVED_AWAITING_PAYMENT", "Đã duyệt, chờ thanh toán"
    EXPIRED_UNPAID = "EXPIRED_UNPAID", "Hết hạn thanh toán"
    PAID_CONFIRMED = "PAID_CONFIRMED", "Đã thanh toán"
    IN_PROGRESS = "IN_PROGRESS", "Đang diễn ra"
    COMPLETED = "COMPLETED", "Hoàn thành"
    CANCELLED_BY_USER = "CANCELLED_BY_USER", "Người dùng hủy"
    CANCELLED_BY_EXPERT = "CANCELLED_BY_EXPERT", "Chuyên gia hủy"
    NO_SHOW_USER = "NO_SHOW_USER", "Người dùng vắng mặt"
    NO_SHOW_EXPERT = "NO_SHOW_EXPERT", "Chuyên gia vắng mặt"
    REFUND_PENDING = "REFUND_PENDING", "Chờ hoàn tiền"
    REFUNDED = "REFUNDED", "Đã hoàn tiền"


class ExpertApplicationStatus(models.TextChoices):
    PENDING_REVIEW = "PENDING_REVIEW", "Chờ xét duyệt"
    APPROVED = "APPROVED", "Đã phê duyệt"
    REJECTED = "REJECTED", "Bị từ chối"
    NEEDS_REVISION = "NEEDS_REVISION", "Cần chỉnh sửa"


class PaymentStatus(models.TextChoices):
    PENDING = "PENDING", "Đang chờ"
    PAID = "PAID", "Đã thanh toán"
    FAILED = "FAILED", "Thất bại"
    REFUNDED = "REFUNDED", "Đã hoàn tiền"


SESSION_DURATION_CHOICES = [
    (30, "30 phút"),
    (60, "60 phút"),
    (90, "90 phút"),
]

SLOT_DURATION_MINUTES = 15
