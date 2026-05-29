from django.db.models import Sum
from django.shortcuts import get_object_or_404
from django.utils.text import slugify
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from common.pagination import PageNumberPagination
from common.permissions import IsExpert
from payments.models import Payout

from .models import Expert
from .serializers import (
    ExpertApplicationSerializer,
    PayoutRequestSerializer,
    PayoutSerializer,
    PayoutSummarySerializer,
)

_NOT_IMPLEMENTED = Response({"detail": "Not implemented."}, status=status.HTTP_501_NOT_IMPLEMENTED)


def _application_for_user(user):
    return get_object_or_404(
        Expert.all_objects.select_related("user"), user=user, deleted_at__isnull=True
    )


def _unique_slug(user):
    base = slugify(user.full_name or user.email.split("@")[0]) or "expert"
    slug = base
    index = 1
    while Expert.all_objects.filter(slug=slug).exists():
        index += 1
        slug = f"{base}-{index}"
    return slug


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

    @extend_schema(
        operation_id="submitExpertApplication",
        tags=["Expert Applications"],
        request=ExpertApplicationSerializer,
        responses=ExpertApplicationSerializer,
    )
    def post(self, request):
        if Expert.all_objects.filter(user=request.user, deleted_at__isnull=True).exists():
            return Response(
                {"detail": "You already have an expert application."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = ExpertApplicationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        application = Expert.objects.create(
            user=request.user,
            slug=_unique_slug(request.user),
            display_name=request.user.full_name or request.user.email,
            title=serializer.validated_data["title"],
            company=serializer.validated_data.get("company"),
            bio=serializer.validated_data["bio"],
            category=serializer.validated_data["category"],
            skills=serializer.validated_data["skills"],
            languages=[],
            years_of_experience=serializer.validated_data["years_of_experience"],
            price_per_session=serializer.validated_data["price_per_session"],
            linkedin_url=serializer.validated_data.get("linkedin_url"),
            portfolio_url=serializer.validated_data.get("portfolio_url"),
            certifications=serializer.validated_data.get("certifications", []),
            profile_status=Expert.PENDING_REVIEW,
        )
        return Response(
            ExpertApplicationSerializer(application).data, status=status.HTTP_201_CREATED
        )


class MyExpertApplicationView(APIView):
    """GET/PATCH/DELETE /api/v1/expert-applications/me."""

    permission_classes = [IsAuthenticated]

    @extend_schema(
        operation_id="getMyExpertApplication",
        tags=["Expert Applications"],
        responses=ExpertApplicationSerializer,
    )
    def get(self, request):
        application = _application_for_user(request.user)
        return Response(ExpertApplicationSerializer(application).data)

    @extend_schema(
        operation_id="updateMyExpertApplication",
        tags=["Expert Applications"],
        request=ExpertApplicationSerializer,
        responses=ExpertApplicationSerializer,
    )
    def patch(self, request):
        application = _application_for_user(request.user)
        if application.profile_status == Expert.APPROVED:
            return Response(
                {"detail": "Approved applications cannot be edited here."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = ExpertApplicationSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        field_map = {
            "title": "title",
            "company": "company",
            "bio": "bio",
            "category": "category",
            "skills": "skills",
            "years_of_experience": "years_of_experience",
            "price_per_session": "price_per_session",
            "linkedin_url": "linkedin_url",
            "portfolio_url": "portfolio_url",
            "certifications": "certifications",
        }
        update_fields = []
        for input_field, model_field in field_map.items():
            if input_field in serializer.validated_data:
                setattr(application, model_field, serializer.validated_data[input_field])
                update_fields.append(model_field)

        application.profile_status = Expert.PENDING_REVIEW
        application.reviewed_at = None
        application.admin_note = None
        update_fields.extend(["profile_status", "reviewed_at", "admin_note", "updated_at"])
        application.save(update_fields=update_fields)
        return Response(ExpertApplicationSerializer(application).data)

    @extend_schema(operation_id="withdrawMyExpertApplication", tags=["Expert Applications"])
    def delete(self, request):
        application = _application_for_user(request.user)
        application.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


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
