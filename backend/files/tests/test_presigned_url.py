"""Tests for POST /api/v1/uploads/presigned-url."""

from datetime import UTC, datetime
from unittest.mock import patch

from common.tests.base import BaseAPITestCase
from files.models import UploadedFile

URL = "/api/v1/uploads/presigned-url"

_FAKE_SAS_URL = "https://account.blob.core.windows.net/private/path?sig=x"
_FAKE_EXPIRY = datetime(2026, 5, 16, 12, 0, 0, tzinfo=UTC)


def _patch_azure():
    return patch(
        "files.services.az.generate_sas_upload_url",
        return_value=(_FAKE_SAS_URL, _FAKE_EXPIRY),
    )


class TestPresignedUrl(BaseAPITestCase):
    def setUp(self):
        super().setUp()
        self.user = self.authenticate()

    # ------------------------------------------------------------------
    # Happy path
    # ------------------------------------------------------------------

    def test_returns_sas_url_for_valid_pdf(self):
        with _patch_azure():
            response = self.client.post(
                URL,
                {
                    "filename": "architecture.pdf",
                    "content_type": "application/pdf",
                    "size_bytes": 5 * 1024 * 1024,
                    "purpose": UploadedFile.BOOKING_DOCUMENT,
                },
                format="json",
            )

        self.assertEqual(response.status_code, 200)
        data = response.data
        self.assertIn("file_id", data)
        self.assertEqual(data["upload_url"], _FAKE_SAS_URL)
        self.assertIn("blob_path", data)
        self.assertIn("expires_at", data)
        self.assertEqual(data["required_headers"]["x-ms-blob-type"], "BlockBlob")
        self.assertEqual(data["required_headers"]["Content-Type"], "application/pdf")

    def test_creates_unconfirmed_db_record(self):
        with _patch_azure():
            response = self.client.post(
                URL,
                {
                    "filename": "cv.pdf",
                    "content_type": "application/pdf",
                    "size_bytes": 1024,
                    "purpose": UploadedFile.BOOKING_DOCUMENT,
                },
                format="json",
            )

        self.assertEqual(response.status_code, 200)
        file_id = response.data["file_id"]
        record = UploadedFile.objects.get(id=file_id)
        self.assertFalse(record.confirmed)
        self.assertEqual(record.uploaded_by, self.user)
        self.assertEqual(record.purpose, UploadedFile.BOOKING_DOCUMENT)

    def test_avatar_uses_public_container(self):
        with _patch_azure() as mock_sas:
            self.client.post(
                URL,
                {
                    "filename": "photo.png",
                    "content_type": "image/png",
                    "size_bytes": 1024 * 1024,
                    "purpose": UploadedFile.AVATAR,
                },
                format="json",
            )

        container_arg = mock_sas.call_args[0][0]
        self.assertIn("public", container_arg)

    def test_blob_path_contains_user_id_and_filename_slug(self):
        with _patch_azure():
            response = self.client.post(
                URL,
                {
                    "filename": "My Report 2026.pdf",
                    "content_type": "application/pdf",
                    "size_bytes": 1024,
                    "purpose": UploadedFile.BOOKING_DOCUMENT,
                },
                format="json",
            )

        blob_path = response.data["blob_path"]
        self.assertIn(str(self.user.id), blob_path)
        self.assertIn("my-report-2026", blob_path)

    # ------------------------------------------------------------------
    # Validation — MIME type
    # ------------------------------------------------------------------

    def test_rejects_unsupported_mime_type(self):
        response = self.client.post(
            URL,
            {
                "filename": "virus.exe",
                "content_type": "application/x-msdownload",
                "size_bytes": 1024,
                "purpose": UploadedFile.BOOKING_DOCUMENT,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("content_type", response.data.get("errors", response.data))

    def test_rejects_svg_mime_type(self):
        response = self.client.post(
            URL,
            {
                "filename": "icon.svg",
                "content_type": "image/svg+xml",
                "size_bytes": 512,
                "purpose": UploadedFile.AVATAR,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    # ------------------------------------------------------------------
    # Validation — size limits
    # ------------------------------------------------------------------

    def test_rejects_avatar_over_5mb(self):
        response = self.client.post(
            URL,
            {
                "filename": "huge.png",
                "content_type": "image/png",
                "size_bytes": 6 * 1024 * 1024,
                "purpose": UploadedFile.AVATAR,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("size_bytes", response.data.get("errors", response.data))

    def test_rejects_booking_attachment_over_10mb(self):
        response = self.client.post(
            URL,
            {
                "filename": "big.pdf",
                "content_type": "application/pdf",
                "size_bytes": 11 * 1024 * 1024,
                "purpose": UploadedFile.BOOKING_DOCUMENT,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_accepts_certification_up_to_20mb(self):
        with _patch_azure():
            response = self.client.post(
                URL,
                {
                    "filename": "cert.pdf",
                    "content_type": "application/pdf",
                    "size_bytes": 20 * 1024 * 1024,
                    "purpose": UploadedFile.EXPERT_CERTIFICATE,
                },
                format="json",
            )

        self.assertEqual(response.status_code, 200)

    def test_rejects_zero_size(self):
        response = self.client.post(
            URL,
            {
                "filename": "empty.txt",
                "content_type": "text/plain",
                "size_bytes": 0,
                "purpose": UploadedFile.BOOKING_DOCUMENT,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    # ------------------------------------------------------------------
    # Auth
    # ------------------------------------------------------------------

    def test_unauthenticated_returns_401(self):
        self.client.force_authenticate(user=None)
        response = self.client.post(
            URL,
            {
                "filename": "a.pdf",
                "content_type": "application/pdf",
                "size_bytes": 1024,
                "purpose": UploadedFile.BOOKING_DOCUMENT,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 401)
