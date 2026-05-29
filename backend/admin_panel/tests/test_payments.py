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
        "slug": f"payment-expert-{user.id}",
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
        "status": Booking.PAID_CONFIRMED,
        "problem_description": "I need product advice.",
        "session_goals": "Clarify next steps.",
        "scheduled_at": timezone.now(),
        "duration_minutes": 60,
        "price_vnd": 200000,
    }
    defaults.update(overrides)
    return Booking.objects.create(**defaults)


def create_payment(**overrides):
    booking = overrides.pop("booking", None) or create_booking()
    defaults = {
        "booking": booking,
        "user": booking.user,
        "expert": booking.expert,
        "amount": 200000,
        "status": Payment.PAID,
        "sepay_order_id": "ORDER-1",
        "sepay_transaction_id": "TX-1",
        "transfer_code": "PAYMENT-1",
        "paid_at": timezone.now(),
    }
    defaults.update(overrides)
    return Payment.objects.create(**defaults)


class TestAdminPayments(BaseAPITestCase):
    def authenticate_admin(self):
        return self.authenticate(UserFactory(is_staff=True))

    def test_list_requires_admin(self):
        self.authenticate()
        response = self.client.get("/api/v1/admin/payments")
        self.assertEqual(response.status_code, 403)

    def test_list_returns_payments(self):
        self.authenticate_admin()
        payment = create_payment()

        response = self.client.get("/api/v1/admin/payments")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["id"], str(payment.id))
        self.assertEqual(response.data["results"][0]["expert_name"], payment.expert.display_name)

    def test_detail_returns_payment(self):
        self.authenticate_admin()
        payment = create_payment()

        response = self.client.get(f"/api/v1/admin/payments/{payment.id}")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], str(payment.id))
        self.assertEqual(response.data["booking_id"], str(payment.booking_id))
        self.assertEqual(response.data["user_email"], payment.user.email)

    def test_summary_returns_payment_totals(self):
        self.authenticate_admin()
        create_payment(amount=200000, status=Payment.PAID)
        create_payment(amount=100000, status=Payment.PENDING, paid_at=None)
        create_payment(amount=50000, status=Payment.FAILED, paid_at=None)
        refunded = create_payment(amount=70000, status=Payment.REFUNDED)
        refunded.refund_amount = 70000
        refunded.save(update_fields=["refund_amount"])

        response = self.client.get("/api/v1/admin/payments/summary")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total_collected"], 200000)
        self.assertEqual(response.data["pending_amount"], 100000)
        self.assertEqual(response.data["failed_amount"], 50000)
        self.assertEqual(response.data["refunded_amount"], 70000)

    def test_refund_paid_payment(self):
        self.authenticate_admin()
        payment = create_payment(amount=200000)

        response = self.client.post(
            f"/api/v1/admin/payments/{payment.id}/refund",
            {"amount": 150000},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        payment.refresh_from_db()
        payment.booking.refresh_from_db()
        self.assertEqual(payment.status, Payment.REFUNDED)
        self.assertEqual(payment.refund_amount, 150000)
        self.assertEqual(payment.booking.status, Booking.REFUNDED)

    def test_refund_rejects_pending_payment(self):
        self.authenticate_admin()
        payment = create_payment(status=Payment.PENDING, paid_at=None)

        response = self.client.post(
            f"/api/v1/admin/payments/{payment.id}/refund", {}, format="json"
        )

        self.assertEqual(response.status_code, 400)
        payment.refresh_from_db()
        self.assertEqual(payment.status, Payment.PENDING)

    def test_refund_rejects_amount_above_payment_amount(self):
        self.authenticate_admin()
        payment = create_payment(amount=200000)

        response = self.client.post(
            f"/api/v1/admin/payments/{payment.id}/refund",
            {"amount": 250000},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        payment.refresh_from_db()
        self.assertEqual(payment.status, Payment.PAID)
