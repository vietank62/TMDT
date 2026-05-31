from audit_logs.models import AuditLog
from common.tests.base import BaseAPITestCase
from users.tests.factories import UserFactory


class TestAuditLogListView(BaseAPITestCase):
    def authenticate_admin(self):
        return self.authenticate(UserFactory(is_staff=True))

    def test_unauthenticated_returns_401(self):
        response = self.client.get("/api/v1/admin/audit-logs")
        self.assertEqual(response.status_code, 401)

    def test_non_admin_returns_403(self):
        self.authenticate()
        response = self.client.get("/api/v1/admin/audit-logs")
        self.assertEqual(response.status_code, 403)

    def test_admin_can_list_audit_logs(self):
        admin = self.authenticate_admin()
        log = AuditLog.objects.create(
            actor=admin,
            actor_role=AuditLog.ROLE_ADMIN,
            action="application.approved",
            target_type="expert_application",
            target_id="11111111-1111-1111-1111-111111111111",
            previous_state={"status": "PENDING_REVIEW"},
            new_state={"status": "APPROVED"},
            note="Looks good.",
            ip_address="127.0.0.1",
        )

        response = self.client.get("/api/v1/admin/audit-logs")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["id"], str(log.id))
        self.assertEqual(response.data["results"][0]["actor_id"], str(admin.id))
        self.assertEqual(response.data["results"][0]["action"], "application.approved")
        self.assertEqual(response.data["results"][0]["new_state"], {"status": "APPROVED"})
