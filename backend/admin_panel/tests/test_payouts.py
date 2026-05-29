from common.tests.base import BaseAPITestCase
from experts.models import Expert
from payments.models import Payout
from users.tests.factories import UserFactory


def create_expert(**overrides):
    user = overrides.pop("user", UserFactory())
    defaults = {
        "user": user,
        "slug": f"admin-payout-expert-{user.id}",
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
        "pending_balance": 500000,
    }
    defaults.update(overrides)
    return Expert.objects.create(**defaults)


def create_payout(**overrides):
    expert = overrides.pop("expert", None) or create_expert()
    defaults = {
        "expert": expert,
        "amount": 200000,
        "status": Payout.PENDING,
        "bank_account": {"bank": "VCB", "number": "123456"},
    }
    defaults.update(overrides)
    return Payout.objects.create(**defaults)


class TestAdminPayouts(BaseAPITestCase):
    def authenticate_admin(self):
        return self.authenticate(UserFactory(is_staff=True))

    def test_list_requires_admin(self):
        self.authenticate()
        response = self.client.get("/api/v1/admin/payouts")
        self.assertEqual(response.status_code, 403)

    def test_list_returns_payouts(self):
        self.authenticate_admin()
        payout = create_payout()

        response = self.client.get("/api/v1/admin/payouts")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["id"], str(payout.id))
        self.assertEqual(response.data["results"][0]["expert_name"], payout.expert.display_name)

    def test_process_payout(self):
        self.authenticate_admin()
        expert = create_expert(pending_balance=500000)
        payout = create_payout(expert=expert, amount=200000)

        response = self.client.post(
            f"/api/v1/admin/payouts/{payout.id}/process",
            {"admin_note": "Transferred."},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        payout.refresh_from_db()
        expert.refresh_from_db()
        self.assertEqual(payout.status, Payout.PAID)
        self.assertEqual(payout.admin_note, "Transferred.")
        self.assertIsNotNone(payout.processed_at)
        self.assertEqual(expert.pending_balance, 300000)

    def test_reject_payout(self):
        self.authenticate_admin()
        payout = create_payout()

        response = self.client.post(
            f"/api/v1/admin/payouts/{payout.id}/reject",
            {"admin_note": "Invalid bank account."},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        payout.refresh_from_db()
        self.assertEqual(payout.status, Payout.REJECTED)
        self.assertEqual(response.data["status"], Payout.REJECTED)

    def test_reject_paid_payout_fails(self):
        self.authenticate_admin()
        payout = create_payout(status=Payout.PAID)

        response = self.client.post(f"/api/v1/admin/payouts/{payout.id}/reject", {}, format="json")

        self.assertEqual(response.status_code, 400)
