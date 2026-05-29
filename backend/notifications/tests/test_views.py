from common.tests.base import BaseAPITestCase
from notifications.models import Notification
from users.tests.factories import UserFactory


def create_notification(user, **overrides):
    defaults = {
        "type": "info",
        "title": "New Notification",
        "message": "You have a message.",
        "is_read": False,
    }
    defaults.update(overrides)
    return Notification.objects.create(user=user, **defaults)


class TestNotificationViews(BaseAPITestCase):
    def test_list_notifications_for_authenticated_user(self):
        user = self.authenticate()
        create_notification(user, title="First")
        create_notification(UserFactory(), title="Other")

        response = self.client.get("/api/v1/notifications")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["title"], "First")

    def test_mark_notification_read(self):
        user = self.authenticate()
        notification = create_notification(user, is_read=False)

        response = self.client.post(f"/api/v1/notifications/{notification.id}/read")

        self.assertEqual(response.status_code, 200)
        notification.refresh_from_db()
        self.assertTrue(notification.is_read)

    def test_mark_all_notifications_read(self):
        user = self.authenticate()
        create_notification(user, is_read=False)
        create_notification(user, is_read=False)

        response = self.client.post("/api/v1/notifications/read-all")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(Notification.objects.filter(user=user, is_read=False).count(), 0)
