from django.utils import timezone as tz
from rest_framework import serializers


class CertificationSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    name = serializers.CharField()
    issuer = serializers.CharField()
    year = serializers.IntegerField()
    url = serializers.URLField(required=False, allow_null=True)


class PortfolioItemSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    title = serializers.CharField()
    description = serializers.CharField()
    url = serializers.URLField(required=False, allow_null=True)
    image_url = serializers.URLField(required=False, allow_null=True)


class ExpertProfileSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    user_id = serializers.CharField(read_only=True)
    slug = serializers.CharField(read_only=True)
    display_name = serializers.CharField()
    title = serializers.CharField()
    company = serializers.CharField(required=False, allow_null=True)
    bio = serializers.CharField()
    skills = serializers.ListField(child=serializers.CharField())
    years_of_experience = serializers.IntegerField()
    price_per_session = serializers.IntegerField()
    session_duration_minutes = serializers.IntegerField(required=False)
    rating = serializers.FloatField(read_only=True)
    review_count = serializers.IntegerField(read_only=True)
    total_sessions = serializers.IntegerField(read_only=True)
    linkedin_url = serializers.URLField(required=False, allow_null=True)
    portfolio_url = serializers.URLField(required=False, allow_null=True)
    certifications = CertificationSerializer(many=True, read_only=True)
    portfolio = PortfolioItemSerializer(many=True, read_only=True)
    languages = serializers.ListField(child=serializers.CharField(), required=False)
    category = serializers.CharField()
    is_available = serializers.BooleanField()
    profile_picture_url = serializers.URLField(required=False, allow_null=True)
    profile_status = serializers.CharField(read_only=True)
    total_earnings = serializers.IntegerField(read_only=True)
    pending_balance = serializers.IntegerField(read_only=True)

    def to_representation(self, instance):
        return {
            "id": str(instance.id),
            "user_id": str(instance.user_id),
            "slug": instance.slug,
            "display_name": instance.display_name,
            "title": instance.title,
            "company": instance.company,
            "bio": instance.bio,
            "skills": instance.skills,
            "years_of_experience": instance.years_of_experience,
            "price_per_session": instance.price_per_session,
            "session_duration_minutes": instance.session_duration_minutes,
            "rating": float(instance.rating),
            "review_count": instance.review_count,
            "total_sessions": instance.total_sessions,
            "linkedin_url": instance.linkedin_url,
            "portfolio_url": instance.portfolio_url,
            "certifications": instance.certifications,
            "portfolio": instance.portfolio,
            "languages": instance.languages,
            "category": instance.category,
            "is_available": instance.is_available,
            "profile_picture_url": instance.profile_picture_url,
            "profile_status": instance.profile_status,
            "total_earnings": instance.total_earnings,
            "pending_balance": instance.pending_balance,
        }


class ExpertProfileUpdateSerializer(serializers.Serializer):
    display_name = serializers.CharField(required=False)
    title = serializers.CharField(required=False)
    company = serializers.CharField(required=False, allow_null=True)
    bio = serializers.CharField(required=False, min_length=100)
    skills = serializers.ListField(child=serializers.CharField(), required=False)
    price_per_session = serializers.IntegerField(required=False, min_value=100000)
    session_duration_minutes = serializers.ChoiceField(
        choices=[30, 60, 90], required=False
    )
    languages = serializers.ListField(child=serializers.CharField(), required=False)
    is_available = serializers.BooleanField(required=False)
    linkedin_url = serializers.URLField(required=False, allow_null=True)
    portfolio_url = serializers.URLField(required=False, allow_null=True)
    profile_picture_url = serializers.URLField(required=False, allow_null=True)
    years_of_experience = serializers.IntegerField(required=False, min_value=0)
    category = serializers.CharField(required=False)


class CertificationUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(required=False)
    issuer = serializers.CharField(required=False)
    year = serializers.IntegerField(required=False)
    url = serializers.URLField(required=False, allow_null=True)


class PortfolioItemUpdateSerializer(serializers.Serializer):
    title = serializers.CharField(required=False)
    description = serializers.CharField(required=False)
    url = serializers.URLField(required=False, allow_null=True)
    image_url = serializers.URLField(required=False, allow_null=True)


class AvailabilitySlotSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    expert_id = serializers.CharField(read_only=True)
    date = serializers.DateField()
    start_time = serializers.TimeField(format="%H:%M")
    end_time = serializers.TimeField(format="%H:%M", read_only=True)
    is_booked = serializers.BooleanField(read_only=True)

    def to_representation(self, instance):
        local_start = tz.localtime(instance.start_time)
        local_end = tz.localtime(instance.end_time)
        return {
            "id": str(instance.id),
            "expert_id": str(instance.expert_id),
            "date": local_start.date().isoformat(),
            "start_time": local_start.strftime("%H:%M"),
            "end_time": local_end.strftime("%H:%M"),
            "is_booked": instance.is_booked,
        }


class AvailabilitySlotUpdateSerializer(serializers.Serializer):
    date = serializers.DateField(required=False)
    start_time = serializers.TimeField(required=False)
    is_booked = serializers.BooleanField(required=False)


class ExpertApplicationSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    user_id = serializers.CharField(read_only=True)
    applicant_name = serializers.CharField(read_only=True)
    applicant_email = serializers.EmailField(read_only=True)
    applicant_avatar = serializers.URLField(read_only=True, allow_null=True)
    title = serializers.CharField()
    company = serializers.CharField(required=False, allow_null=True)
    years_of_experience = serializers.IntegerField(min_value=1, max_value=50)
    skills = serializers.ListField(child=serializers.CharField(), min_length=1)
    bio = serializers.CharField(min_length=100)
    category = serializers.CharField()
    price_per_session = serializers.IntegerField(min_value=100000)
    linkedin_url = serializers.URLField(required=False, allow_null=True)
    portfolio_url = serializers.URLField(required=False, allow_null=True)
    certifications = CertificationSerializer(many=True, required=False)
    status = serializers.CharField(read_only=True)
    submitted_at = serializers.DateTimeField(read_only=True)
    reviewed_at = serializers.DateTimeField(read_only=True, allow_null=True)
    admin_note = serializers.CharField(read_only=True, allow_null=True)

    def to_representation(self, instance):
        user = instance.user
        return {
            "id": str(instance.id),
            "user_id": str(instance.user_id),
            "applicant_name": user.full_name,
            "applicant_email": user.email,
            "applicant_avatar": user.avatar_url,
            "title": instance.title,
            "company": instance.company,
            "years_of_experience": instance.years_of_experience,
            "skills": instance.skills,
            "bio": instance.bio,
            "category": instance.category,
            "price_per_session": instance.price_per_session,
            "linkedin_url": instance.linkedin_url,
            "portfolio_url": instance.portfolio_url,
            "certifications": instance.certifications,
            "status": instance.profile_status,
            "submitted_at": instance.submitted_at,
            "reviewed_at": instance.reviewed_at,
            "admin_note": instance.admin_note,
        }


class PayoutSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    expert_id = serializers.CharField(read_only=True)
    amount = serializers.IntegerField()
    status = serializers.CharField(read_only=True)
    requested_at = serializers.DateTimeField(read_only=True)
    processed_at = serializers.DateTimeField(read_only=True, allow_null=True)
    bank_account = serializers.DictField(read_only=True)
    admin_note = serializers.CharField(read_only=True, allow_null=True)

    def to_representation(self, instance):
        return {
            "id": str(instance.id),
            "expert_id": str(instance.expert_id),
            "amount": instance.amount,
            "status": instance.status,
            "requested_at": instance.requested_at,
            "processed_at": instance.processed_at,
            "bank_account": instance.bank_account,
            "admin_note": instance.admin_note,
        }


class PayoutRequestSerializer(serializers.Serializer):
    amount = serializers.IntegerField(min_value=1)
    bank_account = serializers.DictField()


class PayoutSummarySerializer(serializers.Serializer):
    total_earnings = serializers.IntegerField()
    pending_balance = serializers.IntegerField()
    total_paid_out = serializers.IntegerField()
