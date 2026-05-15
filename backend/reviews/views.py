from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

_NOT_IMPLEMENTED = Response({"detail": "Not implemented."}, status=status.HTTP_501_NOT_IMPLEMENTED)


class ReviewCreateView(APIView):
    """POST /api/v1/reviews — submit a review for a completed booking."""
    permission_classes = [IsAuthenticated]

    @extend_schema(operation_id="createReview", tags=["Reviews"])
    def post(self, request):
        return _NOT_IMPLEMENTED
