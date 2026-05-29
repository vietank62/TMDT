from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from common.permissions import IsAnyAuthenticatedRole
from users.serializers import UserSerializer


class AuthSyncView(APIView):
    """POST /api/v1/auth/sync

    Called by the frontend after Firebase sign-in to ensure a local user
    record exists and is up-to-date. FirebaseAuthentication handles token
    verification and user creation; this endpoint just returns the profile.
    """

    permission_classes = [IsAnyAuthenticatedRole]

    @extend_schema(operation_id="syncAuthUser", responses={200: UserSerializer})
    def post(self, request):
        claims = request.auth if isinstance(request.auth, dict) else {}
        update_fields = []

        email = claims.get("email")
        if email and request.user.email != email:
            request.user.email = email
            update_fields.append("email")

        full_name = claims.get("name")
        if full_name and request.user.full_name != full_name:
            request.user.full_name = full_name
            update_fields.append("full_name")

        avatar_url = claims.get("picture")
        if avatar_url and request.user.avatar_url != avatar_url:
            request.user.avatar_url = avatar_url
            update_fields.append("avatar_url")

        if update_fields:
            request.user.save(update_fields=update_fields)

        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AuthMeView(APIView):
    """GET /api/v1/auth/me — return the current authenticated user's profile."""

    permission_classes = [IsAnyAuthenticatedRole]

    @extend_schema(operation_id="getAuthMe", responses={200: UserSerializer})
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)
