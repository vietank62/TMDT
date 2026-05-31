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
        "title": "Product Mentor",
        "company": "MicroMentor",
        "bio": "A" * 120,
        "category": "product",
        "skills": ["strategy"],
        "languages": ["vi"],
        "years_of_experience": 5,
        "price_per_session": 200000,
        "session_duration_minutes": 60,
        "profile_status": Expert.APPROVED,
    }
    defaults.update(overrides)
    return Expert.objects.create(**defaults)


def create_booking(**overrides):
    expert = overrides.pop("expert", None) or create_expert()
    defaults = {
        "user": UserFactory(),
        "expert": expert,
        "status": Booking.COMPLETED,
        "problem_description": "I need product advice.",
        "session_goals": "Clarify next steps.",
        "scheduled_at": timezone.now(),
        "duration_minutes": 60,
        "price_vnd": 200000,
    }
    defaults.update(overrides)
    return Booking.objects.create(**defaults)


def create_review(**overrides):
    booking = overrides.pop("booking", None) or create_booking()
    defaults = {
        "booking": booking,
        "reviewer": booking.user,
        "expert": booking.expert,
        "rating": 5,
        "comment": "Helpful session.",
        "is_public": True,
    }
    defaults.update(overrides)
    return Review.objects.create(**defaults)


class TestAdminReviews(BaseAPITestCase):
    def authenticate_admin(self):
        return self.authenticate(UserFactory(is_staff=True))

    def test_list_requires_admin(self):
        self.authenticate()
        response = self.client.get("/api/v1/admin/reviews")
        self.assertEqual(response.status_code, 403)

    def test_list_returns_reviews(self):
        self.authenticate_admin()
        review = create_review()

        response = self.client.get("/api/v1/admin/reviews")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["id"], str(review.id))
        self.assertEqual(
            response.data["results"][0]["expert_name"], review.expert.display_name
        )
        self.assertTrue(response.data["results"][0]["is_public"])

    def test_hide_review(self):
        self.authenticate_admin()
        review = create_review(is_public=True)

        response = self.client.post(f"/api/v1/admin/reviews/{review.id}/hide")

        self.assertEqual(response.status_code, 200)
        review.refresh_from_db()
        self.assertFalse(review.is_public)
        self.assertFalse(response.data["is_public"])

    def test_show_review(self):
        self.authenticate_admin()
        review = create_review(is_public=False)

        response = self.client.post(f"/api/v1/admin/reviews/{review.id}/show")

        self.assertEqual(response.status_code, 200)
        review.refresh_from_db()
        self.assertTrue(review.is_public)
        self.assertTrue(response.data["is_public"])

    def test_hide_missing_review_returns_404(self):
        self.authenticate_admin()
        response = self.client.post(
            "/api/v1/admin/reviews/11111111-1111-1111-1111-111111111111/hide"
        )
        self.assertEqual(response.status_code, 404)
