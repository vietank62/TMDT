from django.urls import path

from . import views

urlpatterns = [
    path("auth/sync", views.AuthSyncView.as_view(), name="auth-sync"),
    path("auth/me", views.AuthMeView.as_view(), name="auth-me"),
]
