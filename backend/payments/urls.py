from django.urls import path

from . import views

urlpatterns = [
    path("payments", views.PaymentListView.as_view(), name="payments-list"),
    path(
        "payments/bookings/<str:booking_id>",
        views.PaymentOrderCreateView.as_view(),
        name="payments-create",
    ),
    path(
        "payments/webhook/sepay",
        views.SEPayWebhookView.as_view(),
        name="payments-webhook-sepay",
    ),
    path(
        "payments/<str:payment_id>/check",
        views.PaymentCheckView.as_view(),
        name="payments-check",
    ),
    path(
        "payments/<str:payment_id>",
        views.PaymentDetailView.as_view(),
        name="payments-detail",
    ),
    path(
        "refunds/bookings/<str:booking_id>",
        views.RefundByBookingView.as_view(),
        name="refunds-by-booking",
    ),
]
