"""Factories for the files app."""

import uuid

import factory
from factory.django import DjangoModelFactory

from files.models import UploadedFile
from users.tests.factories import UserFactory


class UploadedFileFactory(DjangoModelFactory):
    uploaded_by = factory.SubFactory(UserFactory)
    original_filename = factory.Sequence(lambda n: f"document_{n}.pdf")
    stored_name = factory.LazyAttribute(
        lambda o: f"{uuid.uuid4().hex}-{o.original_filename}"
    )
    blob_path = factory.LazyAttribute(
        lambda o: f"booking-attachments/{o.uploaded_by.id}/{o.stored_name}"
    )
    blob_url = ""
    container = "private"
    purpose = UploadedFile.BOOKING_DOCUMENT
    content_type = "application/pdf"
    size_bytes = 1024 * 1024  # 1 MB
    confirmed = True

    class Meta:
        model = UploadedFile
