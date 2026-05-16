from django.urls import path

from . import views

# Public discovery
public_patterns = [
    path("experts", views.ExpertListView.as_view(), name="experts-list"),
    path("experts/<str:expert_id>", views.ExpertDetailView.as_view(), name="experts-detail"),
    path(
        "experts/<str:expert_id>/reviews", views.ExpertReviewsView.as_view(), name="experts-reviews"
    ),
    path(
        "experts/<str:expert_id>/availability",
        views.ExpertPublicAvailabilityView.as_view(),
        name="experts-availability-public",
    ),
]

# Expert applications (any authenticated user)
application_patterns = [
    path(
        "expert-applications",
        views.ExpertApplicationListCreateView.as_view(),
        name="expert-applications-create",
    ),
    path(
        "expert-applications/me",
        views.MyExpertApplicationView.as_view(),
        name="expert-applications-me",
    ),
]

# Expert-only: own profile & availability
expert_patterns = [
    path("expert/profile", views.ExpertProfileView.as_view(), name="expert-profile"),
    path(
        "expert/profile/portfolio",
        views.PortfolioListCreateView.as_view(),
        name="expert-portfolio",
    ),
    path(
        "expert/profile/portfolio/<str:item_id>",
        views.PortfolioItemView.as_view(),
        name="expert-portfolio-item",
    ),
    path(
        "expert/profile/certifications",
        views.CertificationListCreateView.as_view(),
        name="expert-certifications",
    ),
    path(
        "expert/profile/certifications/<str:cert_id>",
        views.CertificationDetailView.as_view(),
        name="expert-certification-detail",
    ),
    path("expert/availability", views.AvailabilityView.as_view(), name="expert-availability"),
    path(
        "expert/availability/<str:slot_id>",
        views.AvailabilitySlotView.as_view(),
        name="expert-availability-slot",
    ),
    path("expert/payouts", views.PayoutListCreateView.as_view(), name="expert-payouts"),
    path(
        "expert/payouts/summary",
        views.PayoutSummaryView.as_view(),
        name="expert-payouts-summary",
    ),
]

urlpatterns = public_patterns + application_patterns + expert_patterns
