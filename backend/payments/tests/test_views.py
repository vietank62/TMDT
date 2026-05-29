import json
import uuid
from datetime import timedelta

from django.test import override_settings
from django.utils import timezone

from bookings.models import Booking
from common.tests.base import BaseAPITestCase
from common.utils import compute_hmac_sha256
from experts.models import Expert
from payments.models import Payment
from users.tests.factories import UserFactory


def create_expert(**overrides):
    user = overrides.pop("user", UserFactory())
    defaults = {
        "user": user,
        "slug": f"payment-expert-{user.id}",
        "display_name": user.full_name,
        "title": "Payment Mentor",
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


def create_booking(user, expert=None, status=Booking.APPROVED_AWAITING_PAYMENT):
    expert = expert or create_expert()
    return Booking.objects.create(
        user=user,
        expert=expert,
        status=status,
        problem_description="Issue details",
        session_goals="Session goals",
        document_urls=[],
        scheduled_at=timezone.now() + timedelta(days=1),
        duration_minutes=30,
        price_vnd=expert.price_per_session,
        expert_response_deadline=timezone.now() + timedelta(hours=24),
        agora_channel=f"booking-{uuid.uuid4().hex}",
    )


class TestPaymentViews(BaseAPITestCase):
    def test_list_my_payments(self):
        user = self.authenticate()
        expert = create_expert()
        booking = create_booking(user, expert=expert)
        Payment.objects.create(
            booking=booking,
            user=user,
            expert=expert,
            amount=booking.price_vnd,
            status=Payment.PENDING,
            sepay_order_id="ORDER-123",
        )
        other_user = UserFactory()
        other_booking = create_booking(other_user, expert=expert)
        Payment.objects.create(
            booking=other_booking,
            user=other_user,
            expert=expert,
            amount=other_booking.price_vnd,
            status=Payment.PENDING,
            sepay_order_id="ORDER-456",
        )

        response = self.client.get("/api/v1/payments")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["sepay_order_id"], "ORDER-123")

    def test_get_payment_detail(self):
        user = self.authenticate()
        expert = create_expert()
        booking = create_booking(user, expert=expert)
        payment = Payment.objects.create(
            booking=booking,
            user=user,
            expert=expert,
            amount=booking.price_vnd,
            status=Payment.PENDING,
            sepay_order_id="ORDER-789",
        )

        response = self.client.get(f"/api/v1/payments/{payment.id}")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], str(payment.id))
        self.assertEqual(response.data["sepay_order_id"], "ORDER-789")

    def test_create_payment_order_for_approved_booking(self):
        user = self.authenticate()
        expert = create_expert()
        booking = create_booking(user, expert=expert)

        response = self.client.post(f"/api/v1/payments/bookings/{booking.id}")

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["status"], Payment.PENDING)
        self.assertIn("sepay_order_id", response.data)
        self.assertIsNotNone(response.data["sepay_qr_code"])
        self.assertTrue(Payment.objects.filter(booking=booking).exists())

    def test_create_payment_order_fails_for_non_awaiting_booking(self):
        user = self.authenticate()
        expert = create_expert()
        booking = create_booking(user, expert=expert, status=Booking.DRAFT)

        response = self.client.post(f"/api/v1/payments/bookings/{booking.id}")

        self.assertEqual(response.status_code, 400)
        self.assertIn("detail", response.data)

    @override_settings(SEPAY_MERCHANT_SECRET_KEY="test-secret")
    def test_sepay_webhook_updates_payment_status(self):
        user = self.authenticate()
        expert = create_expert()
        booking = create_booking(user, expert=expert)
        payment = Payment.objects.create(
            booking=booking,
            user=user,
            expert=expert,
            amount=booking.price_vnd,
            status=Payment.PENDING,
            sepay_order_id="ORDER-TEST",
        )

        payload = {
            "order_id": "ORDER-TEST",
            "status": "paid",
            "transaction_id": "TX-999",
            "transfer_code": "TR-999",
        }
        body = json.dumps(payload)
        signature = compute_hmac_sha256("test-secret", body)

        response = self.client.post(
            "/api/v1/payments/webhook/sepay",
            data=body,
            content_type="application/json",
            HTTP_X_SEPAY_SIGNATURE=signature,
        )

        self.assertEqual(response.status_code, 200)
        payment.refresh_from_db()
        self.assertEqual(payment.status, Payment.PAID)
        self.assertEqual(payment.sepay_transaction_id, "TX-999")
        self.assertEqual(payment.transfer_code, "TR-999")
        self.assertIsNotNone(payment.paid_at)

    @override_settings(SEPAY_MERCHANT_SECRET_KEY="test-secret")
    def test_sepay_webhook_rejects_missing_signature(self):
        response = self.client.post(
            "/api/v1/payments/webhook/sepay",
            data=json.dumps({"order_id": "ORDER-TEST", "status": "paid"}),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 403)
