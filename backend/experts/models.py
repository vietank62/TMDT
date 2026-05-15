from datetime import timedelta

from django.db import models

from common.models import SoftDeleteModel, TimeStampedModel, UUIDModel


class Expert(UUIDModel, TimeStampedModel, SoftDeleteModel):
    PENDING_REVIEW = "PENDING_REVIEW"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    NEEDS_REVISION = "NEEDS_REVISION"

    PROFILE_STATUS_CHOICES = [
        (PENDING_REVIEW, "Chờ xét duyệt"),
        (APPROVED, "Đã duyệt"),
        (REJECTED, "Từ chối"),
        (NEEDS_REVISION, "Cần chỉnh sửa"),
    ]

    DURATION_CHOICES = [(30, "30 phút"), (60, "60 phút"), (90, "90 phút")]

    user = models.OneToOneField(
        "users.User", on_delete=models.CASCADE, related_name="expert_profile"
    )
    slug = models.SlugField(max_length=255, unique=True)
    display_name = models.CharField(max_length=255)
    title = models.CharField(max_length=255)
    company = models.CharField(max_length=255, blank=True, null=True)
    bio = models.TextField()
    category = models.CharField(max_length=100)
    skills = models.JSONField(default=list)
    languages = models.JSONField(default=list)
    years_of_experience = models.PositiveIntegerField(default=0)
    price_per_session = models.PositiveIntegerField(default=0)  # VND
    session_duration_minutes = models.IntegerField(choices=DURATION_CHOICES, default=60)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    review_count = models.PositiveIntegerField(default=0)
    total_sessions = models.PositiveIntegerField(default=0)
    total_earnings = models.PositiveIntegerField(default=0)   # VND
    pending_balance = models.PositiveIntegerField(default=0)  # VND
    profile_picture_url = models.URLField(blank=True, null=True)
    linkedin_url = models.URLField(blank=True, null=True)
    portfolio_url = models.URLField(blank=True, null=True)
    certifications = models.JSONField(default=list)
    portfolio = models.JSONField(default=list)
    is_available = models.BooleanField(default=True)
    profile_status = models.CharField(
        max_length=20, choices=PROFILE_STATUS_CHOICES, default=PENDING_REVIEW
    )
    admin_note = models.TextField(blank=True, null=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "experts"

    def __str__(self) -> str:
        return self.display_name


class AvailabilitySlot(UUIDModel):
    expert = models.ForeignKey(Expert, on_delete=models.CASCADE, related_name="slots")
    start_time = models.DateTimeField()
    # end_time is a persisted computed column in SQL Server (start_time + 15 min).
    # Access via the property below; never assign it.
    is_booked = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "availability_slots"
        unique_together = [("expert", "start_time")]

    @property
    def end_time(self):
        return self.start_time + timedelta(minutes=15)

    def __str__(self) -> str:
        return f"{self.expert.display_name} — {self.start_time}"
