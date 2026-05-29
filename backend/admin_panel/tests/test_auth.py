from common.tests.base import BaseAPITestCase
from users.tests.factories import UserFactory


class TestAdminAuthMeView(BaseAPITestCase):
    def test_get_requires_admin(self):
        self.authenticate()
        response = self.client.get("/api/v1/admin/auth/me")
        self.assertEqual(response.status_code, 403)

    def test_get_returns_admin_profile(self):
        admin = self.authenticate(UserFactory(is_staff=True))

        response = self.client.get("/api/v1/admin/auth/me")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], str(admin.id))
        self.assertEqual(response.data["email"], admin.email)
        self.assertEqual(response.data["roles"], ["admin"])

    def test_patch_updates_admin_profile(self):
        admin = self.authenticate(UserFactory(is_staff=True))

        response = self.client.patch(
            "/api/v1/admin/auth/me",
            {"full_name": "Admin User", "avatar_url": "https://example.com/avatar.png"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        admin.refresh_from_db()
        self.assertEqual(admin.full_name, "Admin User")
        self.assertEqual(admin.avatar_url, "https://example.com/avatar.png")


class TestAdminAuthSyncView(BaseAPITestCase):
    def test_sync_rejects_non_admin_without_claim(self):
        user = self.authenticate()

        response = self.client.post("/api/v1/admin/auth/sync")

        self.assertEqual(response.status_code, 403)
        user.refresh_from_db()
        self.assertFalse(user.is_staff)

    def test_sync_existing_staff_admin(self):
        admin = self.authenticate(UserFactory(is_staff=True))

        response = self.client.post("/api/v1/admin/auth/sync")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], str(admin.id))
        self.assertEqual(response.data["roles"], ["admin"])

    def test_sync_admin_claim_updates_user(self):
        user = UserFactory(is_staff=False, full_name="", avatar_url="")
        self.client.force_authenticate(
            user=user,
            token={
                "admin": True,
                "email": "admin@example.com",
                "name": "Claim Admin",
                "picture": "https://example.com/admin.png",
            },
        )

        response = self.client.post("/api/v1/admin/auth/sync")

        self.assertEqual(response.status_code, 200)
        user.refresh_from_db()
        self.assertTrue(user.is_staff)
        self.assertEqual(user.email, "admin@example.com")
        self.assertEqual(user.full_name, "Claim Admin")
        self.assertEqual(user.avatar_url, "https://example.com/admin.png")
