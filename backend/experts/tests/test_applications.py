from common.tests.base import BaseAPITestCase
from experts.models import Expert
from users.tests.factories import UserFactory


def application_payload(**overrides):
    data = {
        "title": "Product Mentor",
        "company": "MicroMentor",
        "years_of_experience": 5,
        "skills": ["strategy", "research"],
        "bio": "A" * 120,
        "category": "product",
        "price_per_session": 200000,
        "linkedin_url": "https://example.com/linkedin",
        "portfolio_url": "https://example.com/portfolio",
        "certifications": [{"name": "PM", "issuer": "Org", "year": 2024}],
    }
    data.update(overrides)
    return data


def create_application(user=None, **overrides):
    user = user or UserFactory()
    defaults = {
        "user": user,
        "slug": f"application-{user.id}",
        "display_name": user.full_name or user.email,
        "title": "Product Mentor",
        "company": "MicroMentor",
        "bio": "A" * 120,
        "category": "product",
        "skills": ["strategy"],
        "languages": [],
        "years_of_experience": 5,
        "price_per_session": 200000,
        "profile_status": Expert.PENDING_REVIEW,
    }
    defaults.update(overrides)
    return Expert.objects.create(**defaults)


class TestExpertApplications(BaseAPITestCase):
    def test_submit_application(self):
        user = self.authenticate(UserFactory(full_name="Applicant"))

        response = self.client.post(
            "/api/v1/expert-applications",
            application_payload(),
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        application = Expert.objects.get(user=user)
        self.assertEqual(application.profile_status, Expert.PENDING_REVIEW)
        self.assertEqual(application.title, "Product Mentor")
        self.assertEqual(response.data["status"], Expert.PENDING_REVIEW)

    def test_submit_rejects_duplicate_application(self):
        user = self.authenticate()
        create_application(user=user)

        response = self.client.post(
            "/api/v1/expert-applications",
            application_payload(),
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_get_my_application(self):
        user = self.authenticate()
        application = create_application(user=user)

        response = self.client.get("/api/v1/expert-applications/me")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], str(application.id))
        self.assertEqual(response.data["applicant_email"], user.email)

    def test_get_my_application_returns_404_when_missing(self):
        self.authenticate()
        response = self.client.get("/api/v1/expert-applications/me")
        self.assertEqual(response.status_code, 404)

    def test_patch_my_application(self):
        user = self.authenticate()
        application = create_application(
            user=user,
            profile_status=Expert.NEEDS_REVISION,
            admin_note="Please update.",
        )

        response = self.client.patch(
            "/api/v1/expert-applications/me",
            {"title": "Updated Mentor", "skills": ["growth"]},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        application.refresh_from_db()
        self.assertEqual(application.title, "Updated Mentor")
        self.assertEqual(application.skills, ["growth"])
        self.assertEqual(application.profile_status, Expert.PENDING_REVIEW)
        self.assertIsNone(application.admin_note)

    def test_patch_rejects_approved_application(self):
        user = self.authenticate()
        create_application(user=user, profile_status=Expert.APPROVED)

        response = self.client.patch(
            "/api/v1/expert-applications/me",
            {"title": "Updated Mentor"},
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_delete_my_application(self):
        user = self.authenticate()
        application = create_application(user=user)

        response = self.client.delete("/api/v1/expert-applications/me")

        self.assertEqual(response.status_code, 204)
        application.refresh_from_db()
        self.assertTrue(application.is_deleted)
