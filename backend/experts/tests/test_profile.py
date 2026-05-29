from common.tests.base import BaseAPITestCase
from experts.models import Expert
from users.tests.factories import UserFactory


def create_expert(**overrides):
    user = overrides.pop("user", UserFactory())
    defaults = {
        "user": user,
        "slug": f"profile-expert-{user.id}",
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
    }
    defaults.update(overrides)
    return Expert.objects.create(**defaults)


class TestExpertProfile(BaseAPITestCase):
    def authenticate_expert(self, expert=None):
        expert = expert or create_expert()
        self.authenticate(expert.user)
        return expert

    def test_get_profile(self):
        expert = self.authenticate_expert()

        response = self.client.get("/api/v1/expert/profile")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], str(expert.id))
        self.assertEqual(response.data["title"], "Product Mentor")

    def test_patch_profile(self):
        expert = self.authenticate_expert()

        response = self.client.patch(
            "/api/v1/expert/profile",
            {
                "display_name": "Updated Expert",
                "title": "Growth Mentor",
                "skills": ["growth"],
                "languages": ["en"],
                "price_per_session": 300000,
                "is_available": False,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        expert.refresh_from_db()
        self.assertEqual(expert.display_name, "Updated Expert")
        self.assertEqual(expert.title, "Growth Mentor")
        self.assertEqual(expert.skills, ["growth"])
        self.assertEqual(expert.languages, ["en"])
        self.assertEqual(expert.price_per_session, 300000)
        self.assertFalse(expert.is_available)

    def test_add_and_delete_certification(self):
        expert = self.authenticate_expert()

        response = self.client.post(
            "/api/v1/expert/profile/certifications",
            {"name": "PM", "issuer": "Org", "year": 2024, "url": "https://example.com/cert"},
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        expert.refresh_from_db()
        cert_id = expert.certifications[0]["id"]
        self.assertEqual(expert.certifications[0]["name"], "PM")

        response = self.client.delete(f"/api/v1/expert/profile/certifications/{cert_id}")

        self.assertEqual(response.status_code, 204)
        expert.refresh_from_db()
        self.assertEqual(expert.certifications, [])

    def test_add_patch_and_delete_portfolio_item(self):
        expert = self.authenticate_expert()

        response = self.client.post(
            "/api/v1/expert/profile/portfolio",
            {
                "title": "Case Study",
                "description": "Product growth project.",
                "url": "https://example.com/case",
                "image_url": "https://example.com/image.png",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        expert.refresh_from_db()
        item_id = expert.portfolio[0]["id"]

        response = self.client.patch(
            f"/api/v1/expert/profile/portfolio/{item_id}",
            {"title": "Updated Case Study"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        expert.refresh_from_db()
        self.assertEqual(expert.portfolio[0]["title"], "Updated Case Study")

        response = self.client.delete(f"/api/v1/expert/profile/portfolio/{item_id}")

        self.assertEqual(response.status_code, 204)
        expert.refresh_from_db()
        self.assertEqual(expert.portfolio, [])

    def test_delete_missing_portfolio_returns_404(self):
        self.authenticate_expert()

        response = self.client.delete(
            "/api/v1/expert/profile/portfolio/11111111-1111-1111-1111-111111111111"
        )

        self.assertEqual(response.status_code, 404)
