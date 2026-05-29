from django.utils import timezone

from bookings.models import Booking
from common.tests.base import BaseAPITestCase
from experts.models import Expert
from payments.models import Payment
from users.tests.factories import UserFactory


def create_expert(**overrides):
    user = overrides.pop("user", UserFactory())
    defaults = {
        "user": user,
        "slug": f"dashboard-expert-{user.id}",
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
    }
    defaults.update(overrides)
    return Expert.objects.create(**defaults)


def create_booking(**overrides):
    expert = overrides.pop("expert", None) or create_expert(profile_status=Expert.APPROVED)
    defaults = {
        "user": UserFactory(),
        "expert": expert,
        "status": Booking.PAID_CONFIRMED,
        "problem_description": "I need product advice.",
        "session_goals": "Clarify next steps.",
        "scheduled_at": timezone.now(),
        "duration_minutes": 60,
        "price_vnd": 200000,
    }
    defaults.update(overrides)
    return Booking.objects.create(**defaults)


class TestAdminDashboard(BaseAPITestCase):
    def authenticate_admin(self):
        return self.authenticate(UserFactory(is_staff=True))

    def test_dashboard_requires_admin(self):
        self.authenticate()
        response = self.client.get("/api/v1/admin/dashboard")
        self.assertEqual(response.status_code, 403)

    def test_dashboard_returns_summary_metrics(self):
        self.authenticate_admin()
        pending_expert = create_expert(profile_status=Expert.PENDING_REVIEW)
        paid_booking = create_booking(expert=pending_expert, status=Booking.PAID_CONFIRMED)
        completed_booking = create_booking(status=Booking.COMPLETED, price_vnd=300000)
        Payment.objects.create(
            booking=paid_booking,
            user=paid_booking.user,
            expert=paid_booking.expert,
            amount=200000,
            status=Payment.PAID,
            paid_at=timezone.now(),
        )
        Payment.objects.create(
            booking=completed_booking,
            user=completed_booking.user,
            expert=completed_booking.expert,
            amount=300000,
            status=Payment.PENDING,
        )

        response = self.client.get("/api/v1/admin/dashboard")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total_experts"], 2)
        self.assertEqual(response.data["total_bookings"], 2)
        self.assertEqual(response.data["total_revenue"], 200000)
        self.assertEqual(response.data["pending_applications"], 1)
        self.assertEqual(response.data["active_bookings"], 1)
        self.assertEqual(len(response.data["monthly_revenue"]), 6)

        breakdown = {
            item["status"]: item["count"] for item in response.data["booking_status_breakdown"]
        }
        self.assertEqual(breakdown[Booking.PAID_CONFIRMED], 1)
        self.assertEqual(breakdown[Booking.COMPLETED], 1)
