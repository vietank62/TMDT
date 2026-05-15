from rest_framework.permissions import BasePermission


class IsExpert(BasePermission):
    """Allow access only to users with an approved expert profile."""

    def has_permission(self, request, view) -> bool:  # pyright: ignore[reportIncompatibleMethodOverride]
        return bool(
            request.user
            and request.user.is_authenticated
            and hasattr(request.user, "expert_profile")
            and request.user.expert_profile.is_approved
        )


class IsAdminUser(BasePermission):
    """Allow access only to staff/superuser accounts."""

    def has_permission(self, request, view) -> bool:  # pyright: ignore[reportIncompatibleMethodOverride]
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)
