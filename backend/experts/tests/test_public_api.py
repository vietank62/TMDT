from datetime import timedelta

from django.utils import timezone

from bookings.models import Booking
from common.tests.base import BaseAPITestCase
from experts.models import AvailabilitySlot, Expert
from reviews.models import Review
from users.tests.factories import UserFactory


def create_expert(**overrides):
    user = overrides.pop("user", UserFactory())
    defaults = {
        "user": user,
        "slug": f"public-expert-{user.id}",
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


class TestExpertPublicAPI(BaseAPITestCase):
    def test_list_only_returns_approved_experts(self):
        approved = create_expert()
        create_expert(profile_status=Expert.PENDING_REVIEW)

        response = self.client.get("/api/v1/experts")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["id"], str(approved.id))

    def test_get_expert_detail(self):
        expert = create_expert()

        response = self.client.get(f"/api/v1/experts/{expert.id}")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], str(expert.id))
        self.assertEqual(response.data["display_name"], expert.display_name)

    def test_get_expert_detail_for_unapproved_expert_returns_404(self):
        expert = create_expert(profile_status=Expert.PENDING_REVIEW)

        response = self.client.get(f"/api/v1/experts/{expert.id}")

        self.assertEqual(response.status_code, 404)

    def test_public_availability_only_returns_future_unbooked_slots(self):
        expert = create_expert()
        AvailabilitySlot.objects.create(
            expert=expert,
            start_time=timezone.now() + timedelta(days=1),
            is_booked=False,
        )
        AvailabilitySlot.objects.create(
            expert=expert,
            start_time=timezone.now() + timedelta(days=2),
            is_booked=True,
        )
        AvailabilitySlot.objects.create(
            expert=expert,
            start_time=timezone.now() - timedelta(days=1),
            is_booked=False,
        )

        response = self.client.get(f"/api/v1/experts/{expert.id}/availability")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        slot_data = response.data["results"][0]
        self.assertEqual(slot_data["expert_id"], str(expert.id))
        self.assertFalse(slot_data["is_booked"])

    def test_public_reviews_only_returns_public_reviews(self):
        expert = create_expert()
        reviewer = UserFactory()
        booking = Booking.objects.create(
            user=reviewer,
            expert=expert,
            status=Booking.PAID_CONFIRMED,
            problem_description="Issue",
            session_goals="Goals",
            document_urls=[],
            scheduled_at=timezone.now(),
            duration_minutes=30,
            price_vnd=expert.price_per_session,
            expert_response_deadline=timezone.now() + timedelta(hours=24),
            agora_channel="test-channel",
        )
        Review.objects.create(
            booking=booking,
            reviewer=reviewer,
            expert=expert,
            rating=5,
            comment="Great session",
            is_public=True,
        )
        private_booking = Booking.objects.create(
            user=reviewer,
            expert=expert,
            status=Booking.PAID_CONFIRMED,
            problem_description="Issue2",
            session_goals="Goals2",
            document_urls=[],
            scheduled_at=timezone.now(),
            duration_minutes=30,
            price_vnd=expert.price_per_session,
            expert_response_deadline=timezone.now() + timedelta(hours=24),
            agora_channel="test-channel-2",
        )
        Review.objects.create(
            booking=private_booking,
            reviewer=reviewer,
            expert=expert,
            rating=3,
            comment="Private feedback",
            is_public=False,
        )

        response = self.client.get(f"/api/v1/experts/{expert.id}/reviews")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["comment"], "Great session")
