"""Low-level Azure Blob Storage helpers.

All functions are pure I/O — no Django model access here.
"""

from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

from azure.core.exceptions import ResourceNotFoundError
from azure.storage.blob import (
    BlobSasPermissions,
    BlobServiceClient,
    ContentSettings,
    generate_blob_sas,
)
from django.conf import settings

logger = logging.getLogger("micromentor")

_SAS_EXPIRY_MINUTES = 15


def _account_name() -> str:
    return settings.AZURE_ACCOUNT_NAME


def _account_key() -> str:
    return settings.AZURE_ACCOUNT_KEY


def get_blob_service_client() -> BlobServiceClient:
    return BlobServiceClient(
        account_url=f"https://{_account_name()}.blob.core.windows.net",
        credential=_account_key(),
    )


def generate_sas_upload_url(
    container: str,
    blob_path: str,
    content_type: str,
) -> tuple[str, datetime]:
    """Return (sas_url, expires_at) for a write-only upload."""
    expiry = datetime.now(tz=timezone.utc) + timedelta(minutes=_SAS_EXPIRY_MINUTES)
    sas_token = generate_blob_sas(
        account_name=_account_name(),
        container_name=container,
        blob_name=blob_path,
        account_key=_account_key(),
        permission=BlobSasPermissions(create=True, write=True),
        expiry=expiry,
        content_type=content_type,
        protocol="https",
    )
    url = f"https://{_account_name()}.blob.core.windows.net" f"/{container}/{blob_path}?{sas_token}"
    return url, expiry


def blob_exists(container: str, blob_path: str) -> bool:
    """Return True if the blob exists in the container."""
    client = get_blob_service_client()
    blob_client = client.get_blob_client(container=container, blob=blob_path)
    return blob_client.exists()


def get_blob_size(container: str, blob_path: str) -> Optional[int]:
    """Return the blob's size in bytes, or None if it does not exist."""
    client = get_blob_service_client()
    blob_client = client.get_blob_client(container=container, blob=blob_path)
    try:
        props = blob_client.get_blob_properties()
        return props.size
    except ResourceNotFoundError:
        return None


def delete_blob(container: str, blob_path: str) -> None:
    """Delete blob from Azure; silently ignore if it does not exist."""
    client = get_blob_service_client()
    blob_client = client.get_blob_client(container=container, blob=blob_path)
    try:
        blob_client.delete_blob()
    except ResourceNotFoundError:
        logger.warning("Blob not found during delete: %s/%s", container, blob_path)


def get_public_url(container: str, blob_path: str) -> str:
    """Build the public (unauthenticated) URL for a blob in a public container."""
    return f"https://{_account_name()}.blob.core.windows.net/{container}/{blob_path}"


def set_blob_content_type(container: str, blob_path: str, content_type: str) -> None:
    """Update the content-type header on an already-uploaded blob."""
    client = get_blob_service_client()
    blob_client = client.get_blob_client(container=container, blob=blob_path)
    try:
        blob_client.set_http_headers(ContentSettings(content_type=content_type))
    except ResourceNotFoundError:
        pass
