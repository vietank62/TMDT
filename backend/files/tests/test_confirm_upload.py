"""Tests for POST /api/v1/uploads/confirm."""

from unittest.mock import patch

from common.tests.base import BaseAPITestCase
from files.models import UploadedFile
from files.tests.factories import UploadedFileFactory

URL = "/api/v1/uploads/confirm"


def _patch_blob_exists(exists: bool = True):
    return patch("files.services.az.blob_exists", return_value=exists)


def _patch_blob_size(size: int = 1024 * 1024):
    return patch("files.services.az.get_blob_size", return_value=size)


class TestConfirmUpload(BaseAPITestCase):
    def setUp(self):
        super().setUp()
        self.user = self.authenticate()

    def _make_pending(self, **kwargs) -> UploadedFile:
        """Create an unconfirmed UploadedFile owned by self.user."""
        return UploadedFileFactory(  # type: ignore[return-value]
            uploaded_by=self.user,
            confirmed=False,
            **kwargs,
        )

    # ------------------------------------------------------------------
    # Happy path — blob present
    # ------------------------------------------------------------------

    def test_confirms_existing_blob(self):
        record = self._make_pending(size_bytes=1024 * 1024)

        with _patch_blob_exists(True), _patch_blob_size(1024 * 1024):
            response = self.client.post(
                URL,
                {"file_id": str(record.id), "size_bytes": 1024 * 1024},
                format="json",
            )

        self.assertEqual(response.status_code, 201)
        record.refresh_from_db()
        self.assertTrue(record.confirmed)

    def test_response_contains_file_metadata(self):
        record = self._make_pending()

        with _patch_blob_exists(True), _patch_blob_size(record.size_bytes):
            response = self.client.post(
                URL,
                {"file_id": str(record.id), "size_bytes": record.size_bytes},
                format="json",
            )

        data = response.data
        self.assertIn("file_id", data)
        self.assertIn("original_name", data)
        self.assertIn("content_type", data)
        self.assertIn("size", data)
        self.assertIn("category", data)
        self.assertIn("uploaded_at", data)

    def test_public_file_returns_url(self):
        record = self._make_pending(
            purpose=UploadedFile.AVATAR,
            container="public",
        )

        with _patch_blob_exists(True), _patch_blob_size(record.size_bytes):
            response = self.client.post(
                URL,
                {"file_id": str(record.id), "size_bytes": record.size_bytes},
                format="json",
            )

        self.assertIsNotNone(response.data.get("url"))

    def test_private_file_returns_null_url(self):
        record = self._make_pending(
            purpose=UploadedFile.BOOKING_DOCUMENT,
            container="private",
        )

        with _patch_blob_exists(True), _patch_blob_size(record.size_bytes):
            response = self.client.post(
                URL,
                {"file_id": str(record.id), "size_bytes": record.size_bytes},
                format="json",
            )

        self.assertIsNone(response.data.get("url"))

    # ------------------------------------------------------------------
    # Blob missing
    # ------------------------------------------------------------------

    def test_returns_400_when_blob_missing(self):
        record = self._make_pending()

        with _patch_blob_exists(False), _patch_blob_size(None):
            response = self.client.post(
                URL,
                {"file_id": str(record.id), "size_bytes": record.size_bytes},
                format="json",
            )

        self.assertEqual(response.status_code, 400)
        record.refresh_from_db()
        self.assertFalse(record.confirmed)

    # ------------------------------------------------------------------
    # Duplicate confirmation
    # ------------------------------------------------------------------

    def test_returns_404_for_already_confirmed_record(self):
        record = UploadedFileFactory(uploaded_by=self.user, confirmed=True)

        with _patch_blob_exists(True), _patch_blob_size(record.size_bytes):
            response = self.client.post(
                URL,
                {"file_id": str(record.id), "size_bytes": record.size_bytes},
                format="json",
            )

        self.assertEqual(response.status_code, 404)

    # ------------------------------------------------------------------
    # Other user's file
    # ------------------------------------------------------------------

    def test_returns_404_for_other_users_file(self):
        from users.tests.factories import UserFactory

        other = UserFactory()
        record = UploadedFileFactory(uploaded_by=other, confirmed=False)

        with _patch_blob_exists(True), _patch_blob_size(record.size_bytes):
            response = self.client.post(
                URL,
                {"file_id": str(record.id), "size_bytes": record.size_bytes},
                format="json",
            )

        self.assertEqual(response.status_code, 404)

    # ------------------------------------------------------------------
    # Auth
    # ------------------------------------------------------------------

    def test_unauthenticated_returns_401(self):
        self.client.force_authenticate(user=None)
        response = self.client.post(
            URL,
            {"file_id": "00000000-0000-0000-0000-000000000001", "size_bytes": 1024},
            format="json",
        )

        self.assertEqual(response.status_code, 401)
