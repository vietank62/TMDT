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
        response = self.client.patch("/api/v1/users/me", {"full_name": "Nguyễn Văn A"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["full_name"], "Nguyễn Văn A")
