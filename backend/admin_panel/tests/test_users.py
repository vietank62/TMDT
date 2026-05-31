from common.tests.base import BaseAPITestCase
from users.tests.factories import UserFactory


class TestAdminUsers(BaseAPITestCase):
    def authenticate_admin(self):
        return self.authenticate(UserFactory(is_staff=True))

    def test_list_requires_admin(self):
        self.authenticate()
        response = self.client.get("/api/v1/admin/users")
        self.assertEqual(response.status_code, 403)

    def test_list_returns_users(self):
        admin = self.authenticate_admin()
        user = UserFactory(email="member@example.com")

        response = self.client.get("/api/v1/admin/users")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 2)
        ids = {item["id"] for item in response.data["results"]}
        self.assertIn(str(admin.id), ids)
        self.assertIn(str(user.id), ids)

    def test_detail_returns_user(self):
        self.authenticate_admin()
        user = UserFactory(email="member@example.com")

        response = self.client.get(f"/api/v1/admin/users/{user.id}")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], str(user.id))
        self.assertEqual(response.data["email"], "member@example.com")

    def test_patch_updates_user(self):
        self.authenticate_admin()
        user = UserFactory(is_active=True, is_staff=False)

        response = self.client.patch(
            f"/api/v1/admin/users/{user.id}",
            {
                "full_name": "Updated User",
                "phone_number": "0900000000",
                "bio": "Updated bio",
                "timezone": "Asia/Bangkok",
                "profile_completed": True,
                "is_active": False,
                "is_staff": True,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        user.refresh_from_db()
        self.assertEqual(user.full_name, "Updated User")
        self.assertEqual(user.phone_number, "0900000000")
        self.assertEqual(user.bio, "Updated bio")
        self.assertEqual(user.timezone, "Asia/Bangkok")
        self.assertTrue(user.profile_completed)
        self.assertFalse(user.is_active)
        self.assertTrue(user.is_staff)

    def test_detail_returns_404_for_missing_user(self):
        self.authenticate_admin()
        response = self.client.get(
            "/api/v1/admin/users/11111111-1111-1111-1111-111111111111"
        )
        self.assertEqual(response.status_code, 404)
