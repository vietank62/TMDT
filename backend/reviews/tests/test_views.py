from datetime import timedelta

from django.utils import timezone

from bookings.models import Booking
from common.tests.base import BaseAPITestCase
from experts.models import Expert
from reviews.models import Review
from users.tests.factories import UserFactory


def create_expert(**overrides):
    user = overrides.pop("user", UserFactory())
    defaults = {
        "user": user,
        "slug": f"review-expert-{user.id}",
        "display_name": user.full_name,
        "title": "Review Mentor",
        "company": "MicroMentor",
        "bio": "A" * 120,
        "category": "business",
        "skills": ["strategy"],
        "languages": ["vi"],
        "years_of_experience": 5,
        "price_per_session": 200000,
        "session_duration_minutes": 60,
        "profile_status": Expert.APPROVED,
    }
    defaults.update(overrides)
    return Expert.objects.create(**defaults)


def create_booking(user, expert=None, status=Booking.COMPLETED):
    expert = expert or create_expert()
    return Booking.objects.create(
        user=user,
        expert=expert,
        status=status,
        problem_description="Issue details",
        session_goals="Session goals",
        document_urls=[],
        scheduled_at=timezone.now() - timedelta(days=1),
        duration_minutes=30,
        price_vnd=expert.price_per_session,
        expert_response_deadline=timezone.now() - timedelta(days=2),
        agora_channel=f"booking-{user.id}",
    )


class TestReviewCreateView(BaseAPITestCase):
    def test_create_review_for_completed_booking(self):
        user = self.authenticate()
        expert = create_expert()
        booking = create_booking(user, expert=expert, status=Booking.COMPLETED)

        response = self.client.post(
            "/api/v1/reviews",
            {
                "booking_id": str(booking.id),
                "rating": 5,
                "comment": "Excellent session.",
                "is_public": True,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["booking_id"], str(booking.id))
        self.assertEqual(response.data["rating"], 5)
        self.assertTrue(response.data["is_public"])

        review = Review.objects.get(booking=booking)
        self.assertEqual(review.rating, 5)
        self.assertEqual(review.comment, "Excellent session.")
        expert.refresh_from_db()
        self.assertEqual(expert.review_count, 1)
        self.assertEqual(float(expert.rating), 5.0)

    def test_create_review_for_incomplete_booking_returns_400(self):
        user = self.authenticate()
        expert = create_expert()
        booking = create_booking(user, expert=expert, status=Booking.PAID_CONFIRMED)

        response = self.client.post(
            "/api/v1/reviews",
            {
                "booking_id": str(booking.id),
                "rating": 4,
                "comment": "Good session.",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("detail", response.data)

    def test_create_duplicate_review_returns_400(self):
        user = self.authenticate()
        expert = create_expert()
        booking = create_booking(user, expert=expert, status=Booking.COMPLETED)
        Review.objects.create(
            booking=booking,
            reviewer=user,
            expert=expert,
            rating=4,
            comment="Good session.",
            is_public=True,
        )

        response = self.client.post(
            "/api/v1/reviews",
            {
                "booking_id": str(booking.id),
                "rating": 5,
                "comment": "Excellent session.",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("detail", response.data)
