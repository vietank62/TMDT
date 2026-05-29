import uuid

from django.db.models import Sum
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.text import slugify
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from common.pagination import PageNumberPagination
from common.permissions import IsExpert, IsUser, IsUserOrExpert
from payments.models import Payout
from reviews.models import Review

from .models import AvailabilitySlot, Expert
from .serializers import (
    AvailabilitySlotSerializer,
    AvailabilitySlotUpdateSerializer,
    CertificationSerializer,
    ExpertApplicationSerializer,
    ExpertProfileSerializer,
    ExpertProfileUpdateSerializer,
    PayoutRequestSerializer,
    PayoutSerializer,
    PayoutSummarySerializer,
    PortfolioItemSerializer,
    PortfolioItemUpdateSerializer,
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


def _get_my_slot(user, slot_id):
    return get_object_or_404(AvailabilitySlot, id=slot_id, expert=user.expert_profile)


def _get_approved_expert(expert_id):
    return get_object_or_404(
        Expert.objects.select_related("user"), id=expert_id, profile_status=Expert.APPROVED
    )


def _find_json_item(items, item_id):
    for item in items:
        if str(item.get("id")) == str(item_id):
            return item
    return None


# ── Public expert discovery ────────────────────────────────────────────────────


class ExpertListView(APIView):
    """GET /api/v1/experts — search and list approved experts."""

    permission_classes = [AllowAny]

    @extend_schema(operation_id="listExperts", tags=["Experts"])
    def get(self, request):
        queryset = (
            Expert.objects.select_related("user")
            .filter(profile_status=Expert.APPROVED)
            .order_by("display_name")
        )
        paginator = PageNumberPagination()
        page = paginator.paginate_queryset(queryset, request, view=self)
        serializer = ExpertProfileSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


class ExpertDetailView(APIView):
    """GET /api/v1/experts/{expertId} — public expert profile."""

    permission_classes = [AllowAny]

    @extend_schema(operation_id="getExpert", tags=["Experts"])
    def get(self, request, expert_id):
        expert = _get_approved_expert(expert_id)
        return Response(ExpertProfileSerializer(expert).data)


class ExpertReviewsView(APIView):
    """GET /api/v1/experts/{expertId}/reviews — public reviews for an expert."""

    permission_classes = [AllowAny]

    @extend_schema(operation_id="listExpertReviews", tags=["Experts"])
    def get(self, request, expert_id):
        expert = _get_approved_expert(expert_id)
        queryset = (
            Review.objects.filter(expert=expert, is_public=True)
            .select_related("reviewer")
            .order_by("-created_at")
        )
        paginator = PageNumberPagination()
        page = paginator.paginate_queryset(queryset, request, view=self)
        from reviews.serializers import ReviewSerializer

        serializer = ReviewSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


class ExpertPublicAvailabilityView(APIView):
    """GET /api/v1/experts/{expertId}/availability — available slots."""

    permission_classes = [AllowAny]

    @extend_schema(operation_id="getExpertPublicAvailability", tags=["Experts"])
    def get(self, request, expert_id):
        expert = _get_approved_expert(expert_id)
        queryset = AvailabilitySlot.objects.filter(
            expert=expert, is_booked=False, start_time__gte=timezone.now()
        ).order_by("start_time")
        paginator = PageNumberPagination()
        page = paginator.paginate_queryset(queryset, request, view=self)
        serializer = AvailabilitySlotSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


# ── Expert applications ────────────────────────────────────────────────────────


class ExpertApplicationListCreateView(APIView):
    """POST /api/v1/expert-applications — submit application."""

    permission_classes = [IsUser]

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

    permission_classes = [IsUserOrExpert]

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

    @extend_schema(
        operation_id="getMyExpertProfile",
        tags=["Expert Profile"],
        responses=ExpertProfileSerializer,
    )
    def get(self, request):
        return Response(ExpertProfileSerializer(request.user.expert_profile).data)

    @extend_schema(
        operation_id="updateMyExpertProfile",
        tags=["Expert Profile"],
        request=ExpertProfileUpdateSerializer,
        responses=ExpertProfileSerializer,
    )
    def patch(self, request):
        serializer = ExpertProfileUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        expert = request.user.expert_profile
        update_fields = []
        for field, value in serializer.validated_data.items():
            setattr(expert, field, value)
            update_fields.append(field)

        if update_fields:
            expert.save(update_fields=[*update_fields, "updated_at"])

        return Response(ExpertProfileSerializer(expert).data)


class PortfolioListCreateView(APIView):
    """POST /api/v1/expert/profile/portfolio."""

    permission_classes = [IsAuthenticated, IsExpert]

    @extend_schema(
        operation_id="addPortfolioItem",
        tags=["Expert Profile"],
        request=PortfolioItemSerializer,
        responses=ExpertProfileSerializer,
    )
    def post(self, request):
        serializer = PortfolioItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        expert = request.user.expert_profile
        item = {"id": str(uuid.uuid4()), **serializer.validated_data}
        expert.portfolio = [*expert.portfolio, item]
        expert.save(update_fields=["portfolio", "updated_at"])
        return Response(ExpertProfileSerializer(expert).data, status=status.HTTP_201_CREATED)


class PortfolioItemView(APIView):
    """PATCH/DELETE /api/v1/expert/profile/portfolio/{itemId}."""

    permission_classes = [IsAuthenticated, IsExpert]

    @extend_schema(
        operation_id="updatePortfolioItem",
        tags=["Expert Profile"],
        request=PortfolioItemUpdateSerializer,
        responses=ExpertProfileSerializer,
    )
    def patch(self, request, item_id):
        serializer = PortfolioItemUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        expert = request.user.expert_profile
        item = _find_json_item(expert.portfolio, item_id)
        if item is None:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        item.update(serializer.validated_data)
        expert.save(update_fields=["portfolio", "updated_at"])
        return Response(ExpertProfileSerializer(expert).data)

    @extend_schema(operation_id="deletePortfolioItem", tags=["Expert Profile"])
    def delete(self, request, item_id):
        expert = request.user.expert_profile
        if _find_json_item(expert.portfolio, item_id) is None:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        expert.portfolio = [
            item for item in expert.portfolio if str(item.get("id")) != str(item_id)
        ]
        expert.save(update_fields=["portfolio", "updated_at"])
        return Response(status=status.HTTP_204_NO_CONTENT)


class CertificationListCreateView(APIView):
    """POST /api/v1/expert/profile/certifications."""

    permission_classes = [IsAuthenticated, IsExpert]

    @extend_schema(
        operation_id="addCertification",
        tags=["Expert Profile"],
        request=CertificationSerializer,
        responses=ExpertProfileSerializer,
    )
    def post(self, request):
        serializer = CertificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        expert = request.user.expert_profile
        item = {"id": str(uuid.uuid4()), **serializer.validated_data}
        expert.certifications = [*expert.certifications, item]
        expert.save(update_fields=["certifications", "updated_at"])
        return Response(ExpertProfileSerializer(expert).data, status=status.HTTP_201_CREATED)


class CertificationDetailView(APIView):
    """DELETE /api/v1/expert/profile/certifications/{certId}."""

    permission_classes = [IsAuthenticated, IsExpert]

    @extend_schema(operation_id="deleteCertification", tags=["Expert Profile"])
    def delete(self, request, cert_id):
        expert = request.user.expert_profile
        if _find_json_item(expert.certifications, cert_id) is None:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        expert.certifications = [
            item for item in expert.certifications if str(item.get("id")) != str(cert_id)
        ]
        expert.save(update_fields=["certifications", "updated_at"])
        return Response(status=status.HTTP_204_NO_CONTENT)


# ── Availability ───────────────────────────────────────────────────────────────


class AvailabilityView(APIView):
    """GET/POST /api/v1/expert/availability."""

    permission_classes = [IsAuthenticated, IsExpert]

    @extend_schema(
        operation_id="getMyAvailability",
        tags=["Availability"],
        responses=AvailabilitySlotSerializer(many=True),
    )
    def get(self, request):
        queryset = AvailabilitySlot.objects.filter(expert=request.user.expert_profile).order_by(
            "start_time"
        )
        paginator = PageNumberPagination()
        page = paginator.paginate_queryset(queryset, request, view=self)
        serializer = AvailabilitySlotSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    @extend_schema(
        operation_id="createAvailabilitySlots",
        tags=["Availability"],
        request=AvailabilitySlotSerializer,
        responses=AvailabilitySlotSerializer,
    )
    def post(self, request):
        serializer = AvailabilitySlotSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        start_time = timezone.make_aware(
            timezone.datetime.combine(
                serializer.validated_data["date"],
                serializer.validated_data["start_time"],
            ),
            timezone.get_current_timezone(),
        )
        slot, created = AvailabilitySlot.objects.get_or_create(
            expert=request.user.expert_profile,
            start_time=start_time,
            defaults={"is_booked": False},
        )
        response_status = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(AvailabilitySlotSerializer(slot).data, status=response_status)


class AvailabilitySlotView(APIView):
    """PATCH/DELETE /api/v1/expert/availability/{slotId}."""

    permission_classes = [IsAuthenticated, IsExpert]

    @extend_schema(
        operation_id="updateAvailabilitySlot",
        tags=["Availability"],
        request=AvailabilitySlotUpdateSerializer,
        responses=AvailabilitySlotSerializer,
    )
    def patch(self, request, slot_id):
        slot = _get_my_slot(request.user, slot_id)
        serializer = AvailabilitySlotUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        if (
            "date" in serializer.validated_data or "start_time" in serializer.validated_data
        ) and slot.is_booked:
            return Response(
                {"detail": "Booked slots cannot be rescheduled."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if "date" in serializer.validated_data or "start_time" in serializer.validated_data:
            slot_date = serializer.validated_data.get("date", slot.start_time.date())
            slot_time = serializer.validated_data.get(
                "start_time", slot.start_time.timetz().replace(tzinfo=None)
            )
            slot.start_time = timezone.make_aware(
                timezone.datetime.combine(slot_date, slot_time),
                timezone.get_current_timezone(),
            )

        if "is_booked" in serializer.validated_data:
            slot.is_booked = serializer.validated_data["is_booked"]

        slot.save(update_fields=["start_time", "is_booked", "updated_at"])
        return Response(AvailabilitySlotSerializer(slot).data)

    @extend_schema(operation_id="deleteAvailabilitySlot", tags=["Availability"])
    def delete(self, request, slot_id):
        slot = _get_my_slot(request.user, slot_id)
        if slot.is_booked:
            return Response(
                {"detail": "Booked slots cannot be deleted."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        slot.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


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
