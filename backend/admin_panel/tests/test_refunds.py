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
        "slug": f"refund-expert-{user.id}",
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
        "status": Booking.REFUND_PENDING,
        "problem_description": "I need product advice.",
        "session_goals": "Clarify next steps.",
        "scheduled_at": timezone.now(),
        "duration_minutes": 60,
        "price_vnd": 200000,
    }
    defaults.update(overrides)
    return Booking.objects.create(**defaults)


def create_refund_payment(**overrides):
    booking = overrides.pop("booking", None) or create_booking()
    defaults = {
        "booking": booking,
        "user": booking.user,
        "expert": booking.expert,
        "amount": 200000,
        "status": Payment.PAID,
        "paid_at": timezone.now(),
    }
    defaults.update(overrides)
    return Payment.objects.create(**defaults)


class TestAdminRefunds(BaseAPITestCase):
    def authenticate_admin(self):
        return self.authenticate(UserFactory(is_staff=True))

    def test_list_requires_admin(self):
        self.authenticate()
        response = self.client.get("/api/v1/admin/refunds")
        self.assertEqual(response.status_code, 403)

    def test_list_returns_refunds(self):
        self.authenticate_admin()
        refund = create_refund_payment()

        response = self.client.get("/api/v1/admin/refunds")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["id"], str(refund.id))
        self.assertEqual(response.data["results"][0]["status"], "PENDING")

    def test_detail_returns_refund(self):
        self.authenticate_admin()
        refund = create_refund_payment()

        response = self.client.get(f"/api/v1/admin/refunds/{refund.id}")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["payment_id"], str(refund.id))
        self.assertEqual(response.data["booking_id"], str(refund.booking_id))
        self.assertEqual(response.data["amount"], refund.amount)

    def test_process_refund(self):
        self.authenticate_admin()
        refund = create_refund_payment()

        response = self.client.post(
            f"/api/v1/admin/refunds/{refund.id}/process",
            {"admin_note": "Processed."},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        refund.refresh_from_db()
        refund.booking.refresh_from_db()
        self.assertEqual(refund.status, Payment.REFUNDED)
        self.assertEqual(refund.refund_amount, refund.amount)
        self.assertIsNotNone(refund.refunded_at)
        self.assertEqual(refund.booking.status, Booking.REFUNDED)
        self.assertEqual(response.data["status"], "PROCESSED")

    def test_reject_refund(self):
        self.authenticate_admin()
        refund = create_refund_payment()

        response = self.client.post(
            f"/api/v1/admin/refunds/{refund.id}/reject",
            {"admin_note": "Not eligible."},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        refund.refresh_from_db()
        refund.booking.refresh_from_db()
        self.assertEqual(refund.status, Payment.PAID)
        self.assertEqual(refund.booking.status, Booking.PAID_CONFIRMED)
        self.assertEqual(response.data["status"], "REJECTED")
        self.assertEqual(response.data["admin_note"], "Not eligible.")

    def test_reject_processed_refund_fails(self):
        self.authenticate_admin()
        booking = create_booking(status=Booking.REFUNDED)
        refund = create_refund_payment(
            booking=booking,
            status=Payment.REFUNDED,
            refund_amount=200000,
            refunded_at=timezone.now(),
        )

        response = self.client.post(
            f"/api/v1/admin/refunds/{refund.id}/reject", {}, format="json"
        )

        self.assertEqual(response.status_code, 400)
