"""URL configuration for the files (uploads) app."""

from django.urls import path

from . import views

urlpatterns = [
    path("uploads/presigned-url", views.PresignedUrlView.as_view(), name="uploads-presigned"),
    path("uploads/confirm", views.ConfirmUploadView.as_view(), name="uploads-confirm"),
    path("uploads/download-url", views.PrivateDownloadUrlView.as_view(), name="uploads-download-url"),
    path("uploads/<uuid:file_id>", views.UploadDeleteView.as_view(), name="uploads-delete"),
]
