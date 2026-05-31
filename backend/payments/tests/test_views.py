import uuid
from datetime import timedelta

from django.test import override_settings
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

    @override_settings(
        SEPAY_BANK_ACCOUNT="123456789",
        SEPAY_BANK_CODE="MB",
        SEPAY_PRE_DESCRIPTION="TEST",
    )
    def test_create_payment_order_for_approved_booking(self):
        user = self.authenticate()
        expert = create_expert()
        booking = create_booking(user, expert=expert)

        response = self.client.post(f"/api/v1/payments/bookings/{booking.id}")

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["status"], Payment.PENDING)
        self.assertIn("sepay_order_id", response.data)
        qr_code = response.data["sepay_qr_code"]
        self.assertIsNotNone(qr_code)
        self.assertIn("https://qr.sepay.vn/img", qr_code)
        self.assertIn("acc=123456789", qr_code)
        self.assertIn("bank=MB", qr_code)
        self.assertIn(f"amount={booking.price_vnd}", qr_code)
        self.assertIn("des=TEST", qr_code)
        self.assertTrue(response.data["transfer_code"].startswith("TEST"))
        self.assertTrue(Payment.objects.filter(booking=booking).exists())

    def test_create_payment_order_fails_for_non_awaiting_booking(self):
        user = self.authenticate()
        expert = create_expert()
        booking = create_booking(user, expert=expert, status=Booking.DRAFT)

        response = self.client.post(f"/api/v1/payments/bookings/{booking.id}")

        self.assertEqual(response.status_code, 400)
        self.assertIn("detail", response.data)

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
            transfer_code="MICROMENTORABCDEF12345678901234",
        )

        response = self.client.post(
            "/api/v1/payments/webhook/sepay",
            data={
                "id": 999,
                "gateway": "Vietcombank",
                "transactionDate": "2026-05-31 08:30:00",
                "accountNumber": "123456789",
                "code": None,
                "content": "MICROMENTORABCDEF12345678901234 chuyen tien",
                "transferType": "in",
                "description": "Test payment",
                "transferAmount": booking.price_vnd,
                "accumulated": 1000000,
                "referenceCode": "FT-999",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["success"])
        payment.refresh_from_db()
        self.assertEqual(payment.status, Payment.PAID)
        self.assertEqual(payment.sepay_transaction_id, "999")
        self.assertEqual(payment.sepay_reference_code, "FT-999")
        self.assertEqual(payment.sepay_raw_payload["id"], 999)
        self.assertIsNotNone(payment.paid_at)

        duplicate_response = self.client.post(
            "/api/v1/payments/webhook/sepay",
            data={
                "id": 999,
                "transactionDate": "2026-05-31 08:30:00",
                "content": "MICROMENTORABCDEF12345678901234 chuyen tien",
                "transferType": "in",
                "transferAmount": booking.price_vnd,
            },
            format="json",
        )

        self.assertEqual(duplicate_response.status_code, 200)
        self.assertEqual(
            duplicate_response.data["message"], "Transaction already processed."
        )

    def test_check_payment_returns_current_status(self):
        user = self.authenticate()
        expert = create_expert()
        booking = create_booking(user, expert=expert)
        payment = Payment.objects.create(
            booking=booking,
            user=user,
            expert=expert,
            amount=booking.price_vnd,
            status=Payment.PENDING,
        )

        response = self.client.get(f"/api/v1/payments/{payment.id}/check")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data,
            {"success": True, "paid": False, "status": Payment.PENDING},
        )

    def test_check_payment_does_not_expose_another_users_payment(self):
        self.authenticate()
        other_user = UserFactory()
        expert = create_expert()
        booking = create_booking(other_user, expert=expert)
        payment = Payment.objects.create(
            booking=booking,
            user=other_user,
            expert=expert,
            amount=booking.price_vnd,
        )

        response = self.client.get(f"/api/v1/payments/{payment.id}/check")

        self.assertEqual(response.status_code, 404)

    @override_settings(SEPAY_WEBHOOK_API_KEY="secret")
    def test_sepay_webhook_rejects_invalid_api_key(self):
        response = self.client.post(
            "/api/v1/payments/webhook/sepay",
            data={},
            format="json",
            HTTP_AUTHORIZATION="Apikey wrong",
        )

        self.assertEqual(response.status_code, 401)
        self.assertFalse(response.data["success"])
