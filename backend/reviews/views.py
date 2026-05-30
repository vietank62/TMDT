from datetime import timedelta

from django.shortcuts import get_object_or_404
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from bookings.models import Booking
from common.permissions import IsUserOrAdmin
from reviews.models import Review

from .serializers import ReviewSerializer

_REVIEW_WINDOW_DAYS = 7


class ReviewCreateView(APIView):
    """POST /api/v1/reviews — submit a review for a completed booking."""

    permission_classes = [IsUserOrAdmin]

    @extend_schema(operation_id="createReview", tags=["Reviews"])
    def post(self, request):
        serializer = ReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        booking = get_object_or_404(
            Booking.objects.select_related("expert", "user"),
            id=serializer.validated_data["booking_id"],
            user=request.user,
        )

        if booking.status != Booking.COMPLETED:
            return Response(
                {"detail": "Reviews can only be submitted for completed bookings."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        deadline = booking.updated_at + timedelta(days=_REVIEW_WINDOW_DAYS)
        if timezone.now() > deadline:
            return Response(
                {"detail": "Thời hạn gửi đánh giá đã hết (7 ngày sau khi hoàn thành)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if hasattr(booking, "review"):
            return Response(
                {"detail": "A review for this booking already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        review = Review.objects.create(
            booking=booking,
            reviewer=request.user,
            expert=booking.expert,
            rating=serializer.validated_data["rating"],
            comment=serializer.validated_data["comment"],
            is_public=serializer.validated_data.get("is_public", True),
        )

        expert = booking.expert
        expert.review_count += 1
        expert.rating = round(
            (float(expert.rating) * (expert.review_count - 1) + review.rating)
            / expert.review_count,
            2,
        )
        expert.save(update_fields=["rating", "review_count", "updated_at"])

        return Response(ReviewSerializer(review).data, status=status.HTTP_201_CREATED)
