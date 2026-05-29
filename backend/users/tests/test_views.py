from common.tests.base import BaseAPITestCase


class TestMeView(BaseAPITestCase):
    def test_unauthenticated_returns_401(self):
        response = self.client.get("/api/v1/users/me")
        self.assertEqual(response.status_code, 401)

    def test_authenticated_returns_profile(self):
        user = self.authenticate()
        response = self.client.get("/api/v1/users/me")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["email"], user.email)

    def test_patch_updates_full_name(self):
        self.authenticate()
        response = self.client.patch("/api/v1/users/me", {"full_name": "Updated User"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["full_name"], "Updated User")

    def test_put_updates_profile_partially(self):
        user = self.authenticate()

        response = self.client.put(
            "/api/v1/users/me",
            {
                "full_name": "Updated User",
                "avatar_url": "https://example.com/avatar.png",
                "phone_number": "0900000000",
                "bio": "Updated bio",
                "timezone": "Asia/Bangkok",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        user.refresh_from_db()
        self.assertEqual(user.full_name, "Updated User")
        self.assertEqual(user.avatar_url, "https://example.com/avatar.png")
        self.assertEqual(user.phone_number, "0900000000")
        self.assertEqual(user.bio, "Updated bio")
        self.assertEqual(user.timezone, "Asia/Bangkok")
