from django.urls import path

from . import views

urlpatterns = [
    path("notifications", views.NotificationListView.as_view(), name="notifications-list"),
    path(
        "notifications/read-all",
        views.MarkAllNotificationsReadView.as_view(),
        name="notifications-read-all",
    ),
    path(
        "notifications/<str:notification_id>/read",
        views.MarkNotificationReadView.as_view(),
        name="notifications-read",
    ),
]
