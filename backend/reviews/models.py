from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from common.models import TimeStampedModel, UUIDModel


class Review(UUIDModel, TimeStampedModel):
    booking = models.OneToOneField(
        "bookings.Booking", on_delete=models.CASCADE, related_name="review"
    )
    reviewer = models.ForeignKey(
        "users.User", on_delete=models.CASCADE, related_name="reviews"
    )
    expert = models.ForeignKey(
        "experts.Expert", on_delete=models.CASCADE, related_name="reviews"
    )
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField(blank=True)
    is_public = models.BooleanField(default=True)

    class Meta:
        db_table = "reviews"

    def __str__(self) -> str:
        return f"{self.reviewer} → {self.expert} ({self.rating}★)"
