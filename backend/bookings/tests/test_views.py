from datetime import timedelta

from django.utils import timezone

from bookings.models import Booking
from common.tests.base import BaseAPITestCase
from experts.models import AvailabilitySlot, Expert
from users.tests.factories import UserFactory


def create_expert(**overrides):
    user = overrides.pop("user", UserFactory())
    defaults = {
        "user": user,
        "slug": f"booking-expert-{user.id}",
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


def create_slots(expert, count=2):
    start = timezone.now() + timedelta(days=1)
    return [
        AvailabilitySlot.objects.create(
            expert=expert,
            start_time=start + timedelta(minutes=15 * index),
        )
        for index in range(count)
    ]


def create_booking(**overrides):
    expert = overrides.pop("expert", None) or create_expert()
    defaults = {
        "user": UserFactory(),
        "expert": expert,
        "status": Booking.PENDING_APPROVAL,
        "problem_description": "I need product advice.",
        "session_goals": "Clarify next steps.",
        "scheduled_at": timezone.now() + timedelta(days=1),
        "duration_minutes": 30,
        "price_vnd": expert.price_per_session,
    }
    defaults.update(overrides)
    return Booking.objects.create(**defaults)


class TestBookings(BaseAPITestCase):
    def test_list_returns_user_and_expert_bookings(self):
        user = self.authenticate()
        expert = create_expert(user=UserFactory())
        own_booking = create_booking(user=user, expert=expert)
        other_booking = create_booking()

        response = self.client.get("/api/v1/bookings")

        self.assertEqual(response.status_code, 200)
        ids = {item["id"] for item in response.data["results"]}
        self.assertIn(str(own_booking.id), ids)
        self.assertNotIn(str(other_booking.id), ids)

    def test_create_booking(self):
        user = self.authenticate()
        expert = create_expert()
        slots = create_slots(expert, count=2)

        response = self.client.post(
            "/api/v1/bookings",
            {
                "expert_id": str(expert.id),
                "slot_ids": [str(slot.id) for slot in slots],
                "problem_description": "I need help.",
                "session_goals": "Plan next steps.",
                "document_urls": ["https://example.com/brief.pdf"],
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        booking = Booking.objects.get(id=response.data["id"])
        self.assertEqual(booking.user, user)
        self.assertEqual(booking.status, Booking.PENDING_APPROVAL)
        self.assertEqual(booking.duration_minutes, 30)
        self.assertEqual(booking.price_vnd, expert.price_per_session)
        self.assertEqual(booking.booking_slots.count(), 2)
        self.assertFalse(
            AvailabilitySlot.objects.filter(
                id__in=[slot.id for slot in slots], is_booked=False
            ).exists()
        )

    def test_detail_requires_participant(self):
        self.authenticate()
        booking = create_booking()

        response = self.client.get(f"/api/v1/bookings/{booking.id}")

        self.assertEqual(response.status_code, 404)

    def test_detail_returns_booking_for_user(self):
        user = self.authenticate()
        booking = create_booking(user=user)

        response = self.client.get(f"/api/v1/bookings/{booking.id}")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], str(booking.id))

    def test_expert_approves_booking(self):
        expert = create_expert()
        self.authenticate(expert.user)
        booking = create_booking(expert=expert)

        response = self.client.post(
            f"/api/v1/bookings/{booking.id}/approve",
            {"expert_note": "Approved."},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        booking.refresh_from_db()
        self.assertEqual(booking.status, Booking.APPROVED_AWAITING_PAYMENT)
        self.assertEqual(booking.expert_note, "Approved.")
        self.assertIsNotNone(booking.payment_deadline)

    def test_non_expert_cannot_approve_booking(self):
        user = self.authenticate()
        booking = create_booking(user=user)

        response = self.client.post(f"/api/v1/bookings/{booking.id}/approve", {}, format="json")

        self.assertEqual(response.status_code, 403)

    def test_expert_rejects_booking_and_releases_slots(self):
        expert = create_expert()
        slots = create_slots(expert, count=2)
        booking = create_booking(expert=expert)
        for slot in slots:
            slot.is_booked = True
            slot.save(update_fields=["is_booked"])
            booking.booking_slots.create(slot=slot)
        self.authenticate(expert.user)

        response = self.client.post(
            f"/api/v1/bookings/{booking.id}/reject",
            {"rejection_reason": "Unavailable."},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        booking.refresh_from_db()
        self.assertEqual(booking.status, Booking.REJECTED)
        self.assertFalse(
            AvailabilitySlot.objects.filter(
                id__in=[slot.id for slot in slots], is_booked=True
            ).exists()
        )

    def test_cancel_booking(self):
        user = self.authenticate()
        booking = create_booking(user=user)

        response = self.client.post(
            f"/api/v1/bookings/{booking.id}/cancel",
            {"reason": "Changed plans."},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        booking.refresh_from_db()
        self.assertEqual(booking.status, Booking.CANCELLED_BY_USER)
        self.assertEqual(booking.rejection_reason, "Changed plans.")

    def test_complete_booking(self):
        user = self.authenticate()
        booking = create_booking(user=user, status=Booking.PAID_CONFIRMED)

        response = self.client.post(f"/api/v1/bookings/{booking.id}/complete")

        self.assertEqual(response.status_code, 200)
        booking.refresh_from_db()
        self.assertEqual(booking.status, Booking.COMPLETED)

    def test_session_token_for_paid_booking(self):
        user = self.authenticate()
        booking = create_booking(user=user, status=Booking.PAID_CONFIRMED)

        response = self.client.post(f"/api/v1/bookings/{booking.id}/session-token")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["channel"], f"booking-{booking.id}")
        self.assertIn("uid", response.data)
