from django.utils import timezone

from bookings.models import Booking
from common.tests.base import BaseAPITestCase
from experts.models import Expert
from users.tests.factories import UserFactory


def create_expert(**overrides):
    user = overrides.pop("user", UserFactory())
    defaults = {
        "user": user,
        "slug": f"expert-{user.id}",
        "display_name": user.full_name,
        "title": "Senior Product Mentor",
        "company": "MicroMentor",
        "bio": "A" * 120,
        "category": "product",
        "skills": ["strategy", "research"],
        "languages": ["vi", "en"],
        "years_of_experience": 5,
        "price_per_session": 200000,
        "session_duration_minutes": 60,
        "profile_status": Expert.APPROVED,
    }
    defaults.update(overrides)
    return Expert.objects.create(**defaults)


def create_booking(**overrides):
    defaults = {
        "user": UserFactory(),
        "expert": create_expert(),
        "status": Booking.PAID_CONFIRMED,
        "problem_description": "I need help validating a product idea.",
        "session_goals": "Define next steps and risks.",
        "document_urls": ["https://example.com/brief.pdf"],
        "scheduled_at": timezone.now(),
        "duration_minutes": 60,
        "price_vnd": 200000,
        "agora_channel": "booking-channel",
    }
    defaults.update(overrides)
    return Booking.objects.create(**defaults)


class TestAdminBookings(BaseAPITestCase):
    def authenticate_admin(self):
        return self.authenticate(UserFactory(is_staff=True))

    def test_list_requires_admin(self):
        self.authenticate()
        response = self.client.get("/api/v1/admin/bookings")
        self.assertEqual(response.status_code, 403)

    def test_list_returns_bookings(self):
        self.authenticate_admin()
        booking = create_booking()

        response = self.client.get("/api/v1/admin/bookings")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["id"], str(booking.id))
        self.assertEqual(response.data["results"][0]["status"], Booking.PAID_CONFIRMED)
        self.assertEqual(
            response.data["results"][0]["expert_name"], booking.expert.display_name
        )

    def test_detail_returns_booking(self):
        self.authenticate_admin()
        booking = create_booking()

        response = self.client.get(f"/api/v1/admin/bookings/{booking.id}")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], str(booking.id))
        self.assertEqual(response.data["user_email"], booking.user.email)
        self.assertEqual(
            response.data["document_urls"], ["https://example.com/brief.pdf"]
        )

    def test_detail_returns_404_for_missing_booking(self):
        self.authenticate_admin()
        response = self.client.get(
            "/api/v1/admin/bookings/11111111-1111-1111-1111-111111111111"
        )
        self.assertEqual(response.status_code, 404)
