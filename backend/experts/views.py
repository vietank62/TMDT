from django.db.models import Sum
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from common.pagination import PageNumberPagination
from common.permissions import IsExpert
from payments.models import Payout

from .serializers import PayoutRequestSerializer, PayoutSerializer, PayoutSummarySerializer

_NOT_IMPLEMENTED = Response({"detail": "Not implemented."}, status=status.HTTP_501_NOT_IMPLEMENTED)


# ── Public expert discovery ────────────────────────────────────────────────────


class ExpertListView(APIView):
    """GET /api/v1/experts — search and list approved experts."""

    permission_classes = [AllowAny]

    @extend_schema(operation_id="listExperts", tags=["Experts"])
    def get(self, request):
        return _NOT_IMPLEMENTED


class ExpertDetailView(APIView):
    """GET /api/v1/experts/{expertId} — public expert profile."""

    permission_classes = [AllowAny]

    @extend_schema(operation_id="getExpert", tags=["Experts"])
    def get(self, request, expert_id):
        return _NOT_IMPLEMENTED


class ExpertReviewsView(APIView):
    """GET /api/v1/experts/{expertId}/reviews — public reviews for an expert."""

    permission_classes = [AllowAny]

    @extend_schema(operation_id="listExpertReviews", tags=["Experts"])
    def get(self, request, expert_id):
        return _NOT_IMPLEMENTED


class ExpertPublicAvailabilityView(APIView):
    """GET /api/v1/experts/{expertId}/availability — available slots."""

    permission_classes = [AllowAny]

    @extend_schema(operation_id="getExpertPublicAvailability", tags=["Experts"])
    def get(self, request, expert_id):
        return _NOT_IMPLEMENTED


# ── Expert applications ────────────────────────────────────────────────────────


class ExpertApplicationListCreateView(APIView):
    """POST /api/v1/expert-applications — submit application."""

    permission_classes = [IsAuthenticated]

    @extend_schema(operation_id="submitExpertApplication", tags=["Expert Applications"])
    def post(self, request):
        return _NOT_IMPLEMENTED


class MyExpertApplicationView(APIView):
    """GET/PATCH/DELETE /api/v1/expert-applications/me."""

    permission_classes = [IsAuthenticated]

    @extend_schema(operation_id="getMyExpertApplication", tags=["Expert Applications"])
    def get(self, request):
        return _NOT_IMPLEMENTED

    @extend_schema(operation_id="updateMyExpertApplication", tags=["Expert Applications"])
    def patch(self, request):
        return _NOT_IMPLEMENTED

    @extend_schema(operation_id="withdrawMyExpertApplication", tags=["Expert Applications"])
    def delete(self, request):
        return Response(status=status.HTTP_501_NOT_IMPLEMENTED)


# ── Expert profile management ──────────────────────────────────────────────────


class ExpertProfileView(APIView):
    """GET/PATCH /api/v1/expert/profile."""

    permission_classes = [IsAuthenticated, IsExpert]

    @extend_schema(operation_id="getMyExpertProfile", tags=["Expert Profile"])
    def get(self, request):
        return _NOT_IMPLEMENTED

    @extend_schema(operation_id="updateMyExpertProfile", tags=["Expert Profile"])
    def patch(self, request):
        return _NOT_IMPLEMENTED


class PortfolioListCreateView(APIView):
    """POST /api/v1/expert/profile/portfolio."""

    permission_classes = [IsAuthenticated, IsExpert]

    @extend_schema(operation_id="addPortfolioItem", tags=["Expert Profile"])
    def post(self, request):
        return _NOT_IMPLEMENTED


class PortfolioItemView(APIView):
    """PATCH/DELETE /api/v1/expert/profile/portfolio/{itemId}."""

    permission_classes = [IsAuthenticated, IsExpert]

    @extend_schema(operation_id="updatePortfolioItem", tags=["Expert Profile"])
    def patch(self, request, item_id):
        return _NOT_IMPLEMENTED

    @extend_schema(operation_id="deletePortfolioItem", tags=["Expert Profile"])
    def delete(self, request, item_id):
        return Response(status=status.HTTP_501_NOT_IMPLEMENTED)


class CertificationListCreateView(APIView):
    """POST /api/v1/expert/profile/certifications."""

    permission_classes = [IsAuthenticated, IsExpert]

    @extend_schema(operation_id="addCertification", tags=["Expert Profile"])
    def post(self, request):
        return _NOT_IMPLEMENTED


class CertificationDetailView(APIView):
    """DELETE /api/v1/expert/profile/certifications/{certId}."""

    permission_classes = [IsAuthenticated, IsExpert]

    @extend_schema(operation_id="deleteCertification", tags=["Expert Profile"])
    def delete(self, request, cert_id):
        return Response(status=status.HTTP_501_NOT_IMPLEMENTED)


# ── Availability ───────────────────────────────────────────────────────────────


class AvailabilityView(APIView):
    """GET/POST /api/v1/expert/availability."""

    permission_classes = [IsAuthenticated, IsExpert]

    @extend_schema(operation_id="getMyAvailability", tags=["Availability"])
    def get(self, request):
        return _NOT_IMPLEMENTED

    @extend_schema(operation_id="createAvailabilitySlots", tags=["Availability"])
    def post(self, request):
        return _NOT_IMPLEMENTED


class AvailabilitySlotView(APIView):
    """PATCH/DELETE /api/v1/expert/availability/{slotId}."""

    permission_classes = [IsAuthenticated, IsExpert]

    @extend_schema(operation_id="updateAvailabilitySlot", tags=["Availability"])
    def patch(self, request, slot_id):
        return _NOT_IMPLEMENTED

    @extend_schema(operation_id="deleteAvailabilitySlot", tags=["Availability"])
    def delete(self, request, slot_id):
        return Response(status=status.HTTP_501_NOT_IMPLEMENTED)


# ── Payouts ────────────────────────────────────────────────────────────────────


class PayoutListCreateView(APIView):
    """GET/POST /api/v1/expert/payouts."""

    permission_classes = [IsAuthenticated, IsExpert]

    @extend_schema(
        operation_id="listMyPayouts",
        tags=["Payouts"],
        responses=PayoutSerializer(many=True),
    )
    def get(self, request):
        queryset = Payout.objects.filter(expert=request.user.expert_profile).order_by(
            "-requested_at"
        )
        paginator = PageNumberPagination()
        page = paginator.paginate_queryset(queryset, request, view=self)
        serializer = PayoutSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    @extend_schema(
        operation_id="requestPayout",
        tags=["Payouts"],
        request=PayoutRequestSerializer,
        responses=PayoutSerializer,
    )
    def post(self, request):
        serializer = PayoutRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        expert = request.user.expert_profile
        amount = serializer.validated_data["amount"]
        if amount > expert.pending_balance:
            return Response(
                {"amount": ["Payout amount cannot exceed pending balance."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        payout = Payout.objects.create(
            expert=expert,
            amount=amount,
            bank_account=serializer.validated_data["bank_account"],
        )
        return Response(PayoutSerializer(payout).data, status=status.HTTP_201_CREATED)


class PayoutSummaryView(APIView):
    """GET /api/v1/expert/payouts/summary."""

    permission_classes = [IsAuthenticated, IsExpert]

    @extend_schema(
        operation_id="getPayoutSummary",
        tags=["Payouts"],
        responses=PayoutSummarySerializer,
    )
    def get(self, request):
        expert = request.user.expert_profile
        total_paid_out = (
            Payout.objects.filter(expert=expert, status=Payout.PAID).aggregate(total=Sum("amount"))[
                "total"
            ]
            or 0
        )
        data = {
            "total_earnings": expert.total_earnings,
            "pending_balance": expert.pending_balance,
            "total_paid_out": total_paid_out,
        }
        return Response(PayoutSummarySerializer(data).data)
