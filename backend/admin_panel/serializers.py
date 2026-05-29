from rest_framework import serializers


class AdminSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    firebase_uid = serializers.CharField(read_only=True)
    email = serializers.EmailField(read_only=True)
    full_name = serializers.CharField()
    avatar_url = serializers.URLField(required=False, allow_null=True)
    roles = serializers.ListField(child=serializers.CharField(), read_only=True)
    created_at = serializers.DateTimeField(read_only=True)

    def to_representation(self, instance):
        roles = []
        if instance.is_staff:
            roles.append("admin")
        if instance.is_superuser:
            roles.append("superuser")

        return {
            "id": str(instance.id),
            "firebase_uid": instance.firebase_uid,
            "email": instance.email,
            "full_name": instance.full_name,
            "avatar_url": instance.avatar_url,
            "roles": roles,
            "created_at": instance.created_at,
        }


class AdminUpdateSerializer(serializers.Serializer):
    full_name = serializers.CharField(required=False)
    avatar_url = serializers.URLField(required=False, allow_blank=True)


class AdminDashboardSerializer(serializers.Serializer):
    total_users = serializers.IntegerField()
    total_experts = serializers.IntegerField()
    total_bookings = serializers.IntegerField()
    total_revenue = serializers.IntegerField()
    pending_applications = serializers.IntegerField()
    active_bookings = serializers.IntegerField()
    monthly_revenue = serializers.ListField()
    booking_status_breakdown = serializers.ListField()


class AdminPaymentSummarySerializer(serializers.Serializer):
    total_collected = serializers.IntegerField()
    pending_amount = serializers.IntegerField()
    refunded_amount = serializers.IntegerField()
    failed_amount = serializers.IntegerField(required=False)


class AdminApplicationSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    user_id = serializers.CharField(read_only=True)
    applicant_name = serializers.CharField(read_only=True)
    applicant_email = serializers.EmailField(read_only=True)
    applicant_avatar = serializers.URLField(read_only=True, allow_blank=True)
    display_name = serializers.CharField(read_only=True)
    title = serializers.CharField(read_only=True)
    company = serializers.CharField(read_only=True, allow_null=True)
    bio = serializers.CharField(read_only=True)
    category = serializers.CharField(read_only=True)
    skills = serializers.ListField(child=serializers.CharField(), read_only=True)
    languages = serializers.ListField(child=serializers.CharField(), read_only=True)
    years_of_experience = serializers.IntegerField(read_only=True)
    price_per_session = serializers.IntegerField(read_only=True)
    session_duration_minutes = serializers.IntegerField(read_only=True)
    linkedin_url = serializers.URLField(read_only=True, allow_null=True)
    portfolio_url = serializers.URLField(read_only=True, allow_null=True)
    certifications = serializers.ListField(read_only=True)
    portfolio = serializers.ListField(read_only=True)
    status = serializers.CharField(read_only=True)
    admin_note = serializers.CharField(read_only=True, allow_null=True)
    submitted_at = serializers.DateTimeField(read_only=True)
    reviewed_at = serializers.DateTimeField(read_only=True, allow_null=True)

    def to_representation(self, instance):
        user = instance.user
        return {
            "id": str(instance.id),
            "user_id": str(instance.user_id),
            "applicant_name": user.full_name,
            "applicant_email": user.email,
            "applicant_avatar": user.avatar_url,
            "display_name": instance.display_name,
            "title": instance.title,
            "company": instance.company,
            "bio": instance.bio,
            "category": instance.category,
            "skills": instance.skills,
            "languages": instance.languages,
            "years_of_experience": instance.years_of_experience,
            "price_per_session": instance.price_per_session,
            "session_duration_minutes": instance.session_duration_minutes,
            "linkedin_url": instance.linkedin_url,
            "portfolio_url": instance.portfolio_url,
            "certifications": instance.certifications,
            "portfolio": instance.portfolio,
            "status": instance.profile_status,
            "admin_note": instance.admin_note,
            "submitted_at": instance.submitted_at,
            "reviewed_at": instance.reviewed_at,
        }


class AdminApplicationActionSerializer(serializers.Serializer):
    admin_note = serializers.CharField(required=False, allow_blank=True, allow_null=True)


class AdminBookingSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    user_id = serializers.CharField(read_only=True)
    user_name = serializers.CharField(read_only=True)
    user_email = serializers.EmailField(read_only=True)
    expert_id = serializers.CharField(read_only=True)
    expert_name = serializers.CharField(read_only=True)
    expert_title = serializers.CharField(read_only=True)
    status = serializers.CharField(read_only=True)
    problem_description = serializers.CharField(read_only=True)
    session_goals = serializers.CharField(read_only=True)
    document_urls = serializers.ListField(read_only=True)
    scheduled_at = serializers.DateTimeField(read_only=True, allow_null=True)
    duration_minutes = serializers.IntegerField(read_only=True)
    price_vnd = serializers.IntegerField(read_only=True)
    expert_response_deadline = serializers.DateTimeField(read_only=True, allow_null=True)
    payment_deadline = serializers.DateTimeField(read_only=True, allow_null=True)
    rejection_reason = serializers.CharField(read_only=True, allow_null=True)
    expert_note = serializers.CharField(read_only=True, allow_null=True)
    agora_channel = serializers.CharField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    def to_representation(self, instance):
        return {
            "id": str(instance.id),
            "user_id": str(instance.user_id),
            "user_name": instance.user.full_name,
            "user_email": instance.user.email,
            "expert_id": str(instance.expert_id),
            "expert_name": instance.expert.display_name,
            "expert_title": instance.expert.title,
            "status": instance.status,
            "problem_description": instance.problem_description,
            "session_goals": instance.session_goals,
            "document_urls": instance.document_urls,
            "scheduled_at": instance.scheduled_at,
            "duration_minutes": instance.duration_minutes,
            "price_vnd": instance.price_vnd,
            "expert_response_deadline": instance.expert_response_deadline,
            "payment_deadline": instance.payment_deadline,
            "rejection_reason": instance.rejection_reason,
            "expert_note": instance.expert_note,
            "agora_channel": instance.agora_channel,
            "created_at": instance.created_at,
            "updated_at": instance.updated_at,
        }
