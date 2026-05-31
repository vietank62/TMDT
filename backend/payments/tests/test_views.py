import uuid
from datetime import timedelta

from django.test import override_settings
from django.utils import timezone

from audit_logs.models import AuditLog
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

    def test_create_payment_order_returns_paid_payment_after_webhook_confirmation(self):
        user = self.authenticate()
        expert = create_expert()
        booking = create_booking(user, expert=expert, status=Booking.PAID_CONFIRMED)
        payment = Payment.objects.create(
            booking=booking,
            user=user,
            expert=expert,
            amount=booking.price_vnd,
            status=Payment.PAID,
            paid_at=timezone.now(),
        )

        response = self.client.post(f"/api/v1/payments/bookings/{booking.id}")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], str(payment.id))
        self.assertEqual(response.data["status"], Payment.PAID)

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
        self.assertEqual(duplicate_response.data["message"], "Transaction already processed.")

    @override_settings(SEPAY_PRE_DESCRIPTION="DH102969")
    def test_sepay_webhook_handles_real_ocb_payload(self):
        user = self.authenticate()
        expert = create_expert()
        booking = create_booking(user, expert=expert)
        payment = Payment.objects.create(
            booking=booking,
            user=user,
            expert=expert,
            amount=1600000,
            status=Payment.PENDING,
            transfer_code="DH102969D558171C8792402C8122",
        )

        response = self.client.post(
            "/api/v1/payments/webhook/sepay",
            data={
                "gateway": "OCB",
                "transactionDate": "2026-05-31 16:49:00",
                "accountNumber": "0004100046366009",
                "subAccount": "SEPMTV72003",
                "code": "DH102969",
                "content": "131420193981-0975780703-DH102969D558171C8792402C8122",
                "transferType": "in",
                "description": "BankAPINotify 131420193981-0975780703-DH102969D558171C8792402C8122",
                "transferAmount": 1600000,
                "referenceCode": "FT26151WBNH9",
                "accumulated": 0,
                "id": 61252237,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["success"])
        payment.refresh_from_db()
        self.assertEqual(payment.status, Payment.PAID)
        self.assertEqual(payment.sepay_transaction_id, "61252237")
        self.assertTrue(
            AuditLog.objects.filter(
                action="update_payment_status",
                target_id=str(payment.id),
                ip_address="",
            ).exists()
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

    def test_check_payment_marks_expired_payment_and_booking_failed(self):
        user = self.authenticate()
        expert = create_expert()
        booking = create_booking(user, expert=expert)
        payment = Payment.objects.create(
            booking=booking,
            user=user,
            expert=expert,
            amount=booking.price_vnd,
            status=Payment.PENDING,
            expires_at=timezone.now() - timedelta(seconds=1),
        )

        response = self.client.get(f"/api/v1/payments/{payment.id}/check")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.data,
            {"success": True, "paid": False, "status": Payment.FAILED},
        )
        payment.refresh_from_db()
        booking.refresh_from_db()
        self.assertEqual(payment.status, Payment.FAILED)
        self.assertEqual(booking.status, Booking.EXPIRED_UNPAID)

    def test_sepay_webhook_does_not_confirm_transfer_after_payment_deadline(self):
        user = self.authenticate()
        expert = create_expert()
        booking = create_booking(user, expert=expert)
        payment = Payment.objects.create(
            booking=booking,
            user=user,
            expert=expert,
            amount=booking.price_vnd,
            status=Payment.PENDING,
            transfer_code="MICROMENTORABCDEF12345678901234",
            expires_at=timezone.now() - timedelta(minutes=1),
        )

        response = self.client.post(
            "/api/v1/payments/webhook/sepay",
            data={
                "id": 1000,
                "transactionDate": timezone.now().isoformat(),
                "content": payment.transfer_code,
                "transferType": "in",
                "transferAmount": payment.amount,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data["success"])
        payment.refresh_from_db()
        self.assertEqual(payment.status, Payment.PENDING)

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
