from unittest.mock import patch

from common.tests.base import BaseAPITestCase
from experts.models import Expert
from files.models import UploadedFile
from users.tests.factories import UserFactory


def create_expert_user():
    user = UserFactory()
    Expert.objects.create(
        user=user,
        slug=f"role-expert-{user.id}",
        display_name=user.full_name,
        title="Product Mentor",
        company="MicroMentor",
        bio="A" * 120,
        category="product",
        skills=["strategy"],
        languages=["vi"],
        years_of_experience=5,
        price_per_session=200000,
        profile_status=Expert.APPROVED,
    )
    return user


class TestRolePermissions(BaseAPITestCase):
    def test_admin_cannot_use_user_profile_endpoint(self):
        self.authenticate(UserFactory(is_staff=True))

        response = self.client.get("/api/v1/users/me")

        self.assertEqual(response.status_code, 403)

    def test_user_cannot_use_expert_profile_endpoint(self):
        self.authenticate()

        response = self.client.get("/api/v1/expert/profile")

        self.assertEqual(response.status_code, 403)

    def test_expert_cannot_submit_new_expert_application(self):
        self.authenticate(create_expert_user())

        response = self.client.post(
            "/api/v1/expert-applications",
            {
                "title": "Product Mentor",
                "company": "MicroMentor",
                "years_of_experience": 5,
                "skills": ["strategy"],
                "bio": "A" * 120,
                "category": "product",
                "price_per_session": 200000,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 403)

    def test_non_admin_cannot_upload_admin_document(self):
        self.authenticate()

        with patch(
            "files.services.az.generate_sas_upload_url",
            return_value=("https://example.com/upload", "2026-05-29T00:00:00Z"),
        ):
            response = self.client.post(
                "/api/v1/uploads/presigned-url",
                {
                    "filename": "policy.pdf",
                    "content_type": "application/pdf",
                    "size_bytes": 1024,
                    "purpose": UploadedFile.ADMIN_DOCUMENT,
                },
                format="json",
            )

        self.assertEqual(response.status_code, 403)
