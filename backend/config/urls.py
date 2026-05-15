from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView

API_V1 = "api/v1/"

_v1_apps = [
    "common",
    "users",
    "experts",
    "bookings",
    "payments",
    "reviews",
    "notifications",
    "files",
    "admin_panel",
    "audit_logs",
]

urlpatterns = [
    path("admin/", admin.site.urls),
    # OpenAPI
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
    # v1 API — each app owns its own URL prefixes under /api/v1/
    *[path(API_V1, include(f"{app}.urls")) for app in _v1_apps],
]
