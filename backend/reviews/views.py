from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from bookings.models import Booking
from common.permissions import IsUser
from reviews.models import Review

from .serializers import ReviewSerializer


class ReviewCreateView(APIView):
    """POST /api/v1/reviews — submit a review for a completed booking."""

    permission_classes = [IsUser]

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
