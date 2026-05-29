from common.tests.base import BaseAPITestCase
from users.tests.factories import UserFactory


class TestAuthMeView(BaseAPITestCase):
    def test_unauthenticated_returns_401(self):
        response = self.client.get("/api/v1/auth/me")
        self.assertEqual(response.status_code, 401)

    def test_authenticated_returns_profile(self):
        user = self.authenticate()

        response = self.client.get("/api/v1/auth/me")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], str(user.id))
        self.assertEqual(response.data["email"], user.email)


class TestAuthSyncView(BaseAPITestCase):
    def test_unauthenticated_returns_401(self):
        response = self.client.post("/api/v1/auth/sync")
        self.assertEqual(response.status_code, 401)

    def test_authenticated_returns_profile(self):
        user = self.authenticate()

        response = self.client.post("/api/v1/auth/sync")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], str(user.id))
        self.assertEqual(response.data["email"], user.email)

    def test_sync_updates_profile_from_token_claims(self):
        user = UserFactory(email="old@example.com", full_name="", avatar_url="")
        self.client.force_authenticate(
            user=user,
            token={
                "email": "new@example.com",
                "name": "Synced User",
                "picture": "https://example.com/avatar.png",
            },
        )

        response = self.client.post("/api/v1/auth/sync")

        self.assertEqual(response.status_code, 200)
        user.refresh_from_db()
        self.assertEqual(user.email, "new@example.com")
        self.assertEqual(user.full_name, "Synced User")
        self.assertEqual(user.avatar_url, "https://example.com/avatar.png")
