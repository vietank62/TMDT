from django.urls import path

from . import views

urlpatterns = [
    # Auth
    path("admin/auth/sync", views.AdminAuthSyncView.as_view(), name="admin-auth-sync"),
    path("admin/auth/me", views.AdminAuthMeView.as_view(), name="admin-auth-me"),
    # Dashboard
    path("admin/dashboard", views.AdminDashboardView.as_view(), name="admin-dashboard"),
    # Users
    path("admin/users", views.AdminUserListView.as_view(), name="admin-users-list"),
    path("admin/users/<str:user_id>", views.AdminUserDetailView.as_view(), name="admin-users-detail"),
    # Experts
    path("admin/experts", views.AdminExpertListView.as_view(), name="admin-experts-list"),
    path(
        "admin/experts/<str:expert_id>",
        views.AdminExpertDetailView.as_view(),
        name="admin-experts-detail",
    ),
    path(
        "admin/experts/<str:expert_id>/approve-profile",
        views.AdminApproveExpertProfileView.as_view(),
        name="admin-experts-approve-profile",
    ),
    path(
        "admin/experts/<str:expert_id>/reject-profile",
        views.AdminRejectExpertProfileView.as_view(),
        name="admin-experts-reject-profile",
    ),
    # Applications
    path(
        "admin/applications",
        views.AdminApplicationListView.as_view(),
        name="admin-applications-list",
    ),
    path(
        "admin/applications/<str:application_id>",
        views.AdminApplicationDetailView.as_view(),
        name="admin-applications-detail",
    ),
    path(
        "admin/applications/<str:application_id>/approve",
        views.AdminApproveApplicationView.as_view(),
        name="admin-applications-approve",
    ),
    path(
        "admin/applications/<str:application_id>/reject",
        views.AdminRejectApplicationView.as_view(),
        name="admin-applications-reject",
    ),
    path(
        "admin/applications/<str:application_id>/request-revision",
        views.AdminRequestRevisionView.as_view(),
        name="admin-applications-request-revision",
    ),
    # Bookings
    path("admin/bookings", views.AdminBookingListView.as_view(), name="admin-bookings-list"),
    path(
        "admin/bookings/<str:booking_id>",
        views.AdminBookingDetailView.as_view(),
        name="admin-bookings-detail",
    ),
    # Payments
    path(
        "admin/payments/summary",
        views.AdminPaymentSummaryView.as_view(),
        name="admin-payments-summary",
    ),
    path("admin/payments", views.AdminPaymentListView.as_view(), name="admin-payments-list"),
    path(
        "admin/payments/<str:payment_id>",
        views.AdminPaymentDetailView.as_view(),
        name="admin-payments-detail",
    ),
    path(
        "admin/payments/<str:payment_id>/refund",
        views.AdminRefundPaymentView.as_view(),
        name="admin-payments-refund",
    ),
    # Refunds
    path("admin/refunds", views.AdminRefundListView.as_view(), name="admin-refunds-list"),
    path(
        "admin/refunds/<str:refund_id>",
        views.AdminRefundDetailView.as_view(),
        name="admin-refunds-detail",
    ),
    path(
        "admin/refunds/<str:refund_id>/process",
        views.AdminProcessRefundView.as_view(),
        name="admin-refunds-process",
    ),
    path(
        "admin/refunds/<str:refund_id>/reject",
        views.AdminRejectRefundView.as_view(),
        name="admin-refunds-reject",
    ),
    # Reviews
    path("admin/reviews", views.AdminReviewListView.as_view(), name="admin-reviews-list"),
    path(
        "admin/reviews/<str:review_id>/hide",
        views.AdminHideReviewView.as_view(),
        name="admin-reviews-hide",
    ),
    path(
        "admin/reviews/<str:review_id>/show",
        views.AdminShowReviewView.as_view(),
        name="admin-reviews-show",
    ),
    # Payouts
    path("admin/payouts", views.AdminPayoutListView.as_view(), name="admin-payouts-list"),
    path(
        "admin/payouts/<str:payout_id>/process",
        views.AdminProcessPayoutView.as_view(),
        name="admin-payouts-process",
    ),
    path(
        "admin/payouts/<str:payout_id>/reject",
        views.AdminRejectPayoutView.as_view(),
        name="admin-payouts-reject",
    ),
]
