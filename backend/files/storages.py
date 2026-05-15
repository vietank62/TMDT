from django.conf import settings
from storages.backends.azure_storage import AzureStorage


class PublicAzureStorage(AzureStorage):
    """Public container — user avatars and public assets."""

    account_name = settings.AZURE_ACCOUNT_NAME
    account_key = settings.AZURE_ACCOUNT_KEY
    azure_container = settings.AZURE_CONTAINER_PUBLIC
    expiration_secs = None  # public URLs, no expiry


class PrivateAzureStorage(AzureStorage):
    """Private container — booking attachments and expert certifications."""

    account_name = settings.AZURE_ACCOUNT_NAME
    account_key = settings.AZURE_ACCOUNT_KEY
    azure_container = settings.AZURE_CONTAINER_PRIVATE
    expiration_secs = 3600  # signed URLs expire after 1 hour
