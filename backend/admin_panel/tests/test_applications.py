from common.tests.base import BaseAPITestCase
from experts.models import Expert
from users.tests.factories import UserFactory


def create_expert_application(**overrides):
    user = overrides.pop("user", UserFactory())
    defaults = {
        "user": user,
        "slug": f"expert-{user.id}",
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
    }
    defaults.update(overrides)
    return Expert.objects.create(**defaults)


class TestAdminApplications(BaseAPITestCase):
    def authenticate_admin(self):
        return self.authenticate(UserFactory(is_staff=True))

    def test_list_requires_admin(self):
        self.authenticate()
        response = self.client.get("/api/v1/admin/applications")
        self.assertEqual(response.status_code, 403)

    def test_list_returns_applications(self):
        self.authenticate_admin()
        application = create_expert_application()

        response = self.client.get("/api/v1/admin/applications")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["id"], str(application.id))
        self.assertEqual(response.data["results"][0]["status"], Expert.PENDING_REVIEW)

    def test_detail_returns_application(self):
        self.authenticate_admin()
        application = create_expert_application()

        response = self.client.get(f"/api/v1/admin/applications/{application.id}")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], str(application.id))
        self.assertEqual(response.data["applicant_email"], application.user.email)

    def test_approve_application(self):
        self.authenticate_admin()
        application = create_expert_application()

        response = self.client.post(
            f"/api/v1/admin/applications/{application.id}/approve",
            {"admin_note": "Looks good."},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        application.refresh_from_db()
        self.assertEqual(application.profile_status, Expert.APPROVED)
        self.assertEqual(application.admin_note, "Looks good.")
        self.assertIsNotNone(application.reviewed_at)

    def test_reject_application(self):
        self.authenticate_admin()
        application = create_expert_application()

        response = self.client.post(
            f"/api/v1/admin/applications/{application.id}/reject",
            {"admin_note": "Missing evidence."},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        application.refresh_from_db()
        self.assertEqual(application.profile_status, Expert.REJECTED)
        self.assertEqual(response.data["status"], Expert.REJECTED)

    def test_request_revision(self):
        self.authenticate_admin()
        application = create_expert_application()

        response = self.client.post(
            f"/api/v1/admin/applications/{application.id}/request-revision",
            {"admin_note": "Update portfolio."},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        application.refresh_from_db()
        self.assertEqual(application.profile_status, Expert.NEEDS_REVISION)
        self.assertEqual(application.admin_note, "Update portfolio.")
