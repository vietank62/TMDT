from common.tests.base import BaseAPITestCase
from experts.models import Expert
from payments.models import Payout
from users.tests.factories import UserFactory


def create_expert(**overrides):
    user = overrides.pop("user", UserFactory())
    defaults = {
        "user": user,
        "slug": f"expert-payout-{user.id}",
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
        "total_earnings": 900000,
        "pending_balance": 500000,
    }
    defaults.update(overrides)
    return Expert.objects.create(**defaults)


class TestExpertPayouts(BaseAPITestCase):
    def authenticate_expert(self, expert=None):
        expert = expert or create_expert()
        self.authenticate(expert.user)
        return expert

    def test_list_requires_approved_expert(self):
        self.authenticate()
        response = self.client.get("/api/v1/expert/payouts")
        self.assertEqual(response.status_code, 403)

    def test_list_returns_own_payouts(self):
        expert = self.authenticate_expert()
        other_expert = create_expert()
        payout = Payout.objects.create(
            expert=expert,
            amount=200000,
            bank_account={"bank": "VCB", "number": "123456"},
        )
        Payout.objects.create(
            expert=other_expert,
            amount=100000,
            bank_account={"bank": "ACB", "number": "654321"},
        )

        response = self.client.get("/api/v1/expert/payouts")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["id"], str(payout.id))

    def test_create_payout_request(self):
        expert = self.authenticate_expert()

        response = self.client.post(
            "/api/v1/expert/payouts",
            {"amount": 300000, "bank_account": {"bank": "VCB", "number": "123456"}},
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        payout = Payout.objects.get(id=response.data["id"])
        self.assertEqual(payout.expert, expert)
        self.assertEqual(payout.amount, 300000)
        self.assertEqual(payout.status, Payout.PENDING)

    def test_create_rejects_amount_above_pending_balance(self):
        self.authenticate_expert(create_expert(pending_balance=100000))

        response = self.client.post(
            "/api/v1/expert/payouts",
            {"amount": 300000, "bank_account": {"bank": "VCB", "number": "123456"}},
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_summary_returns_balances(self):
        expert = self.authenticate_expert()
        Payout.objects.create(
            expert=expert,
            amount=200000,
            status=Payout.PAID,
            bank_account={"bank": "VCB", "number": "123456"},
        )

        response = self.client.get("/api/v1/expert/payouts/summary")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total_earnings"], 900000)
        self.assertEqual(response.data["pending_balance"], 500000)
        self.assertEqual(response.data["total_paid_out"], 200000)
