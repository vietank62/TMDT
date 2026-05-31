from common.tests.base import BaseAPITestCase
from experts.models import Expert
from users.tests.factories import UserFactory


def create_expert(**overrides):
    user = overrides.pop("user", UserFactory())
    defaults = {
        "user": user,
        "slug": f"admin-expert-{user.id}",
        "display_name": user.full_name,
        "title": "Senior Product Mentor",
        "company": "MicroMentor",
        "bio": "A" * 120,
        "category": "product",
        "skills": ["strategy", "research"],
        "languages": ["vi", "en"],
        "years_of_experience": 5,
        "price_per_session": 200000,
        "session_duration_minutes": 60,
        "profile_status": Expert.PENDING_REVIEW,
    }
    defaults.update(overrides)
    return Expert.objects.create(**defaults)


class TestAdminExperts(BaseAPITestCase):
    def authenticate_admin(self):
        return self.authenticate(UserFactory(is_staff=True))

    def test_list_requires_admin(self):
        self.authenticate()
        response = self.client.get("/api/v1/admin/experts")
        self.assertEqual(response.status_code, 403)

    def test_list_returns_experts(self):
        self.authenticate_admin()
        expert = create_expert(profile_status=Expert.APPROVED)

        response = self.client.get("/api/v1/admin/experts")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["id"], str(expert.id))
        self.assertEqual(response.data["results"][0]["profile_status"], Expert.APPROVED)
        self.assertEqual(response.data["results"][0]["user_email"], expert.user.email)

    def test_detail_returns_expert(self):
        self.authenticate_admin()
        expert = create_expert()

        response = self.client.get(f"/api/v1/admin/experts/{expert.id}")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], str(expert.id))
        self.assertEqual(response.data["display_name"], expert.display_name)
        self.assertEqual(response.data["skills"], ["strategy", "research"])

    def test_approve_profile(self):
        self.authenticate_admin()
        expert = create_expert()

        response = self.client.post(
            f"/api/v1/admin/experts/{expert.id}/approve-profile",
            {"admin_note": "Approved."},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        expert.refresh_from_db()
        self.assertEqual(expert.profile_status, Expert.APPROVED)
        self.assertEqual(expert.admin_note, "Approved.")
        self.assertIsNotNone(expert.reviewed_at)

    def test_reject_profile(self):
        self.authenticate_admin()
        expert = create_expert()

        response = self.client.post(
            f"/api/v1/admin/experts/{expert.id}/reject-profile",
            {"admin_note": "Insufficient profile details."},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        expert.refresh_from_db()
        self.assertEqual(expert.profile_status, Expert.REJECTED)
        self.assertEqual(response.data["profile_status"], Expert.REJECTED)

    def test_detail_returns_404_for_missing_expert(self):
        self.authenticate_admin()
        response = self.client.get("/api/v1/admin/experts/11111111-1111-1111-1111-111111111111")
        self.assertEqual(response.status_code, 404)
