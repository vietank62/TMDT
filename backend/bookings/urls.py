from django.urls import path

from . import views

urlpatterns = [
    path("bookings", views.BookingListCreateView.as_view(), name="bookings-list"),
    path("bookings/<str:booking_id>", views.BookingDetailView.as_view(), name="bookings-detail"),
    path(
        "bookings/<str:booking_id>/approve",
        views.BookingApproveView.as_view(),
        name="bookings-approve",
    ),
    path(
        "bookings/<str:booking_id>/reject",
        views.BookingRejectView.as_view(),
        name="bookings-reject",
    ),
    path(
        "bookings/<str:booking_id>/cancel",
        views.BookingCancelView.as_view(),
        name="bookings-cancel",
    ),
    path(
        "bookings/<str:booking_id>/complete",
        views.BookingCompleteView.as_view(),
        name="bookings-complete",
    ),
    path(
        "bookings/<str:booking_id>/session-token",
        views.BookingSessionTokenView.as_view(),
        name="bookings-session-token",
    ),
]
