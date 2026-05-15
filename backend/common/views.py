from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from users.serializers import UserSerializer


class AuthSyncView(APIView):
    """POST /api/v1/auth/sync

    Called by the frontend after Firebase sign-in to ensure a local user
    record exists and is up-to-date. FirebaseAuthentication handles token
    verification and user creation; this endpoint just returns the profile.
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(responses={200: UserSerializer})
    def post(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AuthMeView(APIView):
    """GET /api/v1/auth/me — return the current authenticated user's profile."""

    permission_classes = [IsAuthenticated]

    @extend_schema(responses={200: UserSerializer})
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)
