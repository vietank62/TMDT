from datetime import date, timedelta

from django.utils import timezone

from common.tests.base import BaseAPITestCase
from experts.models import AvailabilitySlot, Expert
from users.tests.factories import UserFactory


def create_expert(**overrides):
    user = overrides.pop("user", UserFactory())
    defaults = {
        "user": user,
        "slug": f"availability-expert-{user.id}",
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


def create_slot(expert, **overrides):
    defaults = {
        "expert": expert,
        "start_time": timezone.now() + timedelta(days=1),
        "is_booked": False,
    }
    defaults.update(overrides)
    return AvailabilitySlot.objects.create(**defaults)


class TestAvailability(BaseAPITestCase):
    def authenticate_expert(self, expert=None):
        expert = expert or create_expert()
        self.authenticate(expert.user)
        return expert

    def test_list_requires_approved_expert(self):
        self.authenticate()
        response = self.client.get("/api/v1/expert/availability")
        self.assertEqual(response.status_code, 403)

    def test_list_returns_own_slots(self):
        expert = self.authenticate_expert()
        slot = create_slot(expert)
        create_slot(create_expert())

        response = self.client.get("/api/v1/expert/availability")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["id"], str(slot.id))

    def test_create_slot(self):
        expert = self.authenticate_expert()
        slot_date = date.today() + timedelta(days=1)

        response = self.client.post(
            "/api/v1/expert/availability",
            {"date": slot_date.isoformat(), "start_time": "09:00"},
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        slot = AvailabilitySlot.objects.get(id=response.data["id"])
        self.assertEqual(slot.expert, expert)
        self.assertFalse(slot.is_booked)
        self.assertEqual(response.data["start_time"], "09:00")

    def test_patch_slot(self):
        expert = self.authenticate_expert()
        slot = create_slot(expert)
        slot_date = date.today() + timedelta(days=2)

        response = self.client.patch(
            f"/api/v1/expert/availability/{slot.id}",
            {"date": slot_date.isoformat(), "start_time": "10:30", "is_booked": True},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        slot.refresh_from_db()
        self.assertTrue(slot.is_booked)
        self.assertEqual(response.data["date"], slot_date.isoformat())
        self.assertEqual(response.data["start_time"], "10:30")

    def test_patch_rejects_rescheduling_booked_slot(self):
        expert = self.authenticate_expert()
        slot = create_slot(expert, is_booked=True)

        response = self.client.patch(
            f"/api/v1/expert/availability/{slot.id}",
            {"start_time": "10:30"},
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_delete_slot(self):
        expert = self.authenticate_expert()
        slot = create_slot(expert)

        response = self.client.delete(f"/api/v1/expert/availability/{slot.id}")

        self.assertEqual(response.status_code, 204)
        self.assertFalse(AvailabilitySlot.objects.filter(id=slot.id).exists())

    def test_delete_rejects_booked_slot(self):
        expert = self.authenticate_expert()
        slot = create_slot(expert, is_booked=True)

        response = self.client.delete(f"/api/v1/expert/availability/{slot.id}")

        self.assertEqual(response.status_code, 400)
        self.assertTrue(AvailabilitySlot.objects.filter(id=slot.id).exists())
