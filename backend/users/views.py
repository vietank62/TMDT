from drf_spectacular.utils import extend_schema
from rest_framework.generics import RetrieveUpdateAPIView

from common.permissions import IsAnyAuthenticatedRole

from .serializers import UserSerializer, UserUpdateSerializer


class MeView(RetrieveUpdateAPIView):
    """GET /api/v1/users/me — retrieve own profile.
    PATCH /api/v1/users/me — update own profile."""

    permission_classes = [IsAnyAuthenticatedRole]

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return UserUpdateSerializer
        return UserSerializer

    def get_object(self):
        return self.request.user

    @extend_schema(operation_id="getUserMe", responses=UserSerializer)
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        operation_id="updateUserMe",
        request=UserUpdateSerializer,
        responses=UserUpdateSerializer,
    )
    def put(self, request, *args, **kwargs):
        return super().put(request, *args, **kwargs)

    @extend_schema(
        operation_id="partialUpdateUserMe",
        request=UserUpdateSerializer,
        responses=UserUpdateSerializer,
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        kwargs["partial"] = True
        return super().update(request, *args, **kwargs)
