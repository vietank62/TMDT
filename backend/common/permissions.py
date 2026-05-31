from django.core.exceptions import ObjectDoesNotExist
from rest_framework.permissions import BasePermission

ROLE_ADMIN = "ADMIN"
ROLE_EXPERT = "EXPERT"
ROLE_USER = "USER"


def has_approved_expert_profile(user) -> bool:
    if not user or not user.is_authenticated:
        return False

    try:
        return bool(user.expert_profile.is_approved)
    except ObjectDoesNotExist:
        return False


def get_user_role(user) -> str | None:
    if not user or not user.is_authenticated or not user.is_active:
        return None
    if user.is_staff or user.is_superuser:
        return ROLE_ADMIN
    if has_approved_expert_profile(user):
        return ROLE_EXPERT
    return ROLE_USER


def get_user_roles(user) -> list[str]:
    role = get_user_role(user)
    return [role] if role else []


def has_role(user, *roles: str) -> bool:
    return get_user_role(user) in roles


class IsAnyAuthenticatedRole(BasePermission):
    """Allow any authenticated active account with a platform role."""

    def has_permission(self, request, view) -> bool:  # pyright: ignore[reportIncompatibleMethodOverride]
        return get_user_role(request.user) is not None


class IsUser(BasePermission):
    """Allow access only to standard user accounts."""

    def has_permission(self, request, view) -> bool:  # pyright: ignore[reportIncompatibleMethodOverride]
        return has_role(request.user, ROLE_USER)


class IsUserOrExpert(BasePermission):
    """Allow access to non-admin customer and expert accounts."""

    def has_permission(self, request, view) -> bool:  # pyright: ignore[reportIncompatibleMethodOverride]
        return has_role(request.user, ROLE_USER, ROLE_EXPERT)


class IsExpert(BasePermission):
    """Allow access only to users with an approved expert profile."""

    def has_permission(self, request, view) -> bool:  # pyright: ignore[reportIncompatibleMethodOverride]
        return has_role(request.user, ROLE_EXPERT)


class IsUserOrAdmin(BasePermission):
    """Allow access to standard user and admin accounts."""

    def has_permission(self, request, view) -> bool:  # pyright: ignore[reportIncompatibleMethodOverride]
        return has_role(request.user, ROLE_USER, ROLE_ADMIN)


class IsAdminUser(BasePermission):
    """Allow access only to staff/superuser accounts."""

    def has_permission(self, request, view) -> bool:  # pyright: ignore[reportIncompatibleMethodOverride]
        return has_role(request.user, ROLE_ADMIN)
