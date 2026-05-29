from datetime import timedelta

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
        "title": "Refund Mentor",
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


def create_booking(user, expert=None, status=Booking.PAID_CONFIRMED):
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
        agora_channel=f"booking-{user.id}",
    )


class TestRefundByBookingView(BaseAPITestCase):
    def test_get_refund_by_booking_returns_refunded_payment(self):
        user = self.authenticate()
        expert = create_expert()
        booking = create_booking(user, expert=expert, status=Booking.COMPLETED)
        payment = Payment.objects.create(
            booking=booking,
            user=user,
            expert=expert,
            amount=booking.price_vnd,
            status=Payment.REFUNDED,
            sepay_order_id="ORDER-REFUND",
            refund_amount=booking.price_vnd,
            refunded_at=timezone.now(),
        )

        response = self.client.get(f"/api/v1/refunds/bookings/{booking.id}")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], str(payment.id))
        self.assertEqual(response.data["status"], Payment.REFUNDED)
        self.assertEqual(response.data["refund_amount"], booking.price_vnd)

    def test_get_refund_by_booking_returns_404_when_no_refund(self):
        user = self.authenticate()
        expert = create_expert()
        booking = create_booking(user, expert=expert, status=Booking.COMPLETED)
        Payment.objects.create(
            booking=booking,
            user=user,
            expert=expert,
            amount=booking.price_vnd,
            status=Payment.PAID,
            sepay_order_id="ORDER-PAID",
        )

        response = self.client.get(f"/api/v1/refunds/bookings/{booking.id}")

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.data["detail"], "Refund not found.")
