"""Tests for DELETE /api/v1/uploads/{fileId}."""

from unittest.mock import patch

from common.tests.base import BaseAPITestCase
from files.models import UploadedFile
from files.tests.factories import UploadedFileFactory
from users.tests.factories import UserFactory


def _url(file_id) -> str:
    return f"/api/v1/uploads/{file_id}"


def _patch_delete_blob():
    return patch("files.services.az.delete_blob")


class TestDeleteUpload(BaseAPITestCase):
    def setUp(self):
        super().setUp()
        self.user = self.authenticate()

    # ------------------------------------------------------------------
    # Owner can delete
    # ------------------------------------------------------------------

    def test_owner_can_delete_their_file(self):
        record = UploadedFileFactory(uploaded_by=self.user)

        with _patch_delete_blob() as mock_delete:
            response = self.client.delete(_url(record.id))

        self.assertEqual(response.status_code, 204)
        mock_delete.assert_called_once_with(record.container, record.blob_path)

    def test_delete_soft_deletes_db_record(self):
        record = UploadedFileFactory(uploaded_by=self.user)

        with _patch_delete_blob():
            self.client.delete(_url(record.id))

        record.refresh_from_db()
        self.assertIsNotNone(record.deleted_at)

    def test_deleted_record_not_found_on_second_delete(self):
        record = UploadedFileFactory(uploaded_by=self.user)

        with _patch_delete_blob():
            self.client.delete(_url(record.id))
            response = self.client.delete(_url(record.id))

        self.assertEqual(response.status_code, 404)

    # ------------------------------------------------------------------
    # Non-owner forbidden
    # ------------------------------------------------------------------

    def test_non_owner_gets_403(self):
        other = UserFactory()
        record = UploadedFileFactory(uploaded_by=other)

        with _patch_delete_blob() as mock_delete:
            response = self.client.delete(_url(record.id))

        self.assertEqual(response.status_code, 403)
        mock_delete.assert_not_called()

    def test_non_owner_does_not_soft_delete_record(self):
        other = UserFactory()
        record = UploadedFileFactory(uploaded_by=other)

        with _patch_delete_blob():
            self.client.delete(_url(record.id))

        record.refresh_from_db()
        self.assertIsNone(record.deleted_at)

    # ------------------------------------------------------------------
    # Admin can delete any file
    # ------------------------------------------------------------------

    def test_admin_can_delete_any_file(self):
        admin = UserFactory(is_staff=True)
        self.client.force_authenticate(user=admin)

        owner = UserFactory()
        record = UploadedFileFactory(uploaded_by=owner)

        with _patch_delete_blob() as mock_delete:
            response = self.client.delete(_url(record.id))

        self.assertEqual(response.status_code, 204)
        mock_delete.assert_called_once()

    # ------------------------------------------------------------------
    # Not found
    # ------------------------------------------------------------------

    def test_nonexistent_file_returns_404(self):
        import uuid

        with _patch_delete_blob():
            response = self.client.delete(_url(uuid.uuid4()))

        self.assertEqual(response.status_code, 404)

    # ------------------------------------------------------------------
    # Auth
    # ------------------------------------------------------------------

    def test_unauthenticated_returns_401(self):
        self.client.force_authenticate(user=None)
        record = UploadedFileFactory(uploaded_by=self.user)

        response = self.client.delete(_url(record.id))

        self.assertEqual(response.status_code, 401)
