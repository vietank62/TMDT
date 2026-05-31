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


class AdminUserSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    firebase_uid = serializers.CharField(read_only=True)
    email = serializers.EmailField(read_only=True)
    full_name = serializers.CharField(read_only=True)
    avatar_url = serializers.URLField(read_only=True, allow_blank=True)
    phone_number = serializers.CharField(read_only=True)
    bio = serializers.CharField(read_only=True)
    timezone = serializers.CharField(read_only=True)
    profile_completed = serializers.BooleanField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    is_staff = serializers.BooleanField(read_only=True)
    is_superuser = serializers.BooleanField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    def to_representation(self, instance):
        return {
            "id": str(instance.id),
            "firebase_uid": instance.firebase_uid,
            "email": instance.email,
            "full_name": instance.full_name,
            "avatar_url": instance.avatar_url,
            "phone_number": instance.phone_number,
            "bio": instance.bio,
            "timezone": instance.timezone,
            "profile_completed": instance.profile_completed,
            "is_active": instance.is_active,
            "is_staff": instance.is_staff,
            "is_superuser": instance.is_superuser,
            "created_at": instance.created_at,
            "updated_at": instance.updated_at,
        }


class AdminUserUpdateSerializer(serializers.Serializer):
    full_name = serializers.CharField(required=False)
    avatar_url = serializers.URLField(required=False, allow_blank=True)
    phone_number = serializers.CharField(required=False, allow_blank=True)
    bio = serializers.CharField(required=False, allow_blank=True)
    timezone = serializers.CharField(required=False)
    profile_completed = serializers.BooleanField(required=False)
    is_active = serializers.BooleanField(required=False)
    is_staff = serializers.BooleanField(required=False)


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


class AdminPaymentSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    booking_id = serializers.CharField(read_only=True)
    user_id = serializers.CharField(read_only=True)
    user_email = serializers.EmailField(read_only=True)
    expert_id = serializers.CharField(read_only=True)
    expert_name = serializers.CharField(read_only=True)
    amount = serializers.IntegerField(read_only=True)
    status = serializers.CharField(read_only=True)
    sepay_order_id = serializers.CharField(read_only=True)
    sepay_transaction_id = serializers.CharField(read_only=True)
    sepay_qr_code = serializers.CharField(read_only=True, allow_null=True)
    bank_account = serializers.DictField(read_only=True, allow_null=True)
    transfer_code = serializers.CharField(read_only=True, allow_null=True)
    expires_at = serializers.DateTimeField(read_only=True, allow_null=True)
    paid_at = serializers.DateTimeField(read_only=True, allow_null=True)
    refund_amount = serializers.IntegerField(read_only=True)
    refunded_at = serializers.DateTimeField(read_only=True, allow_null=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    def to_representation(self, instance):
        return {
            "id": str(instance.id),
            "booking_id": str(instance.booking_id),
            "user_id": str(instance.user_id),
            "user_email": instance.user.email,
            "expert_id": str(instance.expert_id),
            "expert_name": instance.expert.display_name,
            "amount": instance.amount,
            "status": instance.status,
            "sepay_order_id": instance.sepay_order_id,
            "sepay_transaction_id": instance.sepay_transaction_id,
            "sepay_qr_code": instance.sepay_qr_code,
            "bank_account": instance.bank_account,
            "transfer_code": instance.transfer_code,
            "expires_at": instance.expires_at,
            "paid_at": instance.paid_at,
            "refund_amount": instance.refund_amount,
            "refunded_at": instance.refunded_at,
            "created_at": instance.created_at,
            "updated_at": instance.updated_at,
        }


class AdminPaymentRefundSerializer(serializers.Serializer):
    amount = serializers.IntegerField(required=False, min_value=1)


class AdminPayoutSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    expert_id = serializers.CharField(read_only=True)
    expert_name = serializers.CharField(read_only=True)
    expert_email = serializers.EmailField(read_only=True)
    amount = serializers.IntegerField(read_only=True)
    status = serializers.CharField(read_only=True)
    bank_account = serializers.DictField(read_only=True)
    admin_note = serializers.CharField(read_only=True, allow_null=True)
    requested_at = serializers.DateTimeField(read_only=True)
    processed_at = serializers.DateTimeField(read_only=True, allow_null=True)

    def to_representation(self, instance):
        return {
            "id": str(instance.id),
            "expert_id": str(instance.expert_id),
            "expert_name": instance.expert.display_name,
            "expert_email": instance.expert.user.email,
            "amount": instance.amount,
            "status": instance.status,
            "bank_account": instance.bank_account,
            "admin_note": instance.admin_note,
            "requested_at": instance.requested_at,
            "processed_at": instance.processed_at,
        }


class AdminPayoutActionSerializer(serializers.Serializer):
    admin_note = serializers.CharField(
        required=False, allow_blank=True, allow_null=True
    )


class AdminRefundSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    payment_id = serializers.CharField(read_only=True)
    booking_id = serializers.CharField(read_only=True)
    user_id = serializers.CharField(read_only=True)
    user_email = serializers.EmailField(read_only=True)
    expert_id = serializers.CharField(read_only=True)
    expert_name = serializers.CharField(read_only=True)
    amount = serializers.IntegerField(read_only=True)
    status = serializers.CharField(read_only=True)
    payment_status = serializers.CharField(read_only=True)
    booking_status = serializers.CharField(read_only=True)
    requested_at = serializers.DateTimeField(read_only=True)
    processed_at = serializers.DateTimeField(read_only=True, allow_null=True)
    admin_note = serializers.CharField(read_only=True, allow_null=True)

    def to_representation(self, instance):
        if instance.status == "REFUNDED":
            refund_status = "PROCESSED"
        elif instance.booking.status == "REFUND_PENDING":
            refund_status = "PENDING"
        else:
            refund_status = "NOT_REQUESTED"

        return {
            "id": str(instance.id),
            "payment_id": str(instance.id),
            "booking_id": str(instance.booking_id),
            "user_id": str(instance.user_id),
            "user_email": instance.user.email,
            "expert_id": str(instance.expert_id),
            "expert_name": instance.expert.display_name,
            "amount": instance.refund_amount or instance.amount,
            "status": refund_status,
            "payment_status": instance.status,
            "booking_status": instance.booking.status,
            "requested_at": instance.updated_at,
            "processed_at": instance.refunded_at,
            "admin_note": None,
        }


class AdminRefundActionSerializer(serializers.Serializer):
    admin_note = serializers.CharField(
        required=False, allow_blank=True, allow_null=True
    )


class AdminReviewSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    booking_id = serializers.CharField(read_only=True)
    reviewer_id = serializers.CharField(read_only=True)
    reviewer_email = serializers.EmailField(read_only=True)
    reviewer_name = serializers.CharField(read_only=True)
    expert_id = serializers.CharField(read_only=True)
    expert_name = serializers.CharField(read_only=True)
    rating = serializers.IntegerField(read_only=True)
    comment = serializers.CharField(read_only=True)
    is_public = serializers.BooleanField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    def to_representation(self, instance):
        return {
            "id": str(instance.id),
            "booking_id": str(instance.booking_id),
            "reviewer_id": str(instance.reviewer_id),
            "reviewer_email": instance.reviewer.email,
            "reviewer_name": instance.reviewer.full_name,
            "expert_id": str(instance.expert_id),
            "expert_name": instance.expert.display_name,
            "rating": instance.rating,
            "comment": instance.comment,
            "is_public": instance.is_public,
            "created_at": instance.created_at,
            "updated_at": instance.updated_at,
        }


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
    admin_note = serializers.CharField(
        required=False, allow_blank=True, allow_null=True
    )


class AdminExpertSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    user_id = serializers.CharField(read_only=True)
    user_email = serializers.EmailField(read_only=True)
    user_name = serializers.CharField(read_only=True)
    slug = serializers.CharField(read_only=True)
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
    rating = serializers.FloatField(read_only=True)
    review_count = serializers.IntegerField(read_only=True)
    total_sessions = serializers.IntegerField(read_only=True)
    total_earnings = serializers.IntegerField(read_only=True)
    pending_balance = serializers.IntegerField(read_only=True)
    profile_picture_url = serializers.URLField(read_only=True, allow_null=True)
    linkedin_url = serializers.URLField(read_only=True, allow_null=True)
    portfolio_url = serializers.URLField(read_only=True, allow_null=True)
    certifications = serializers.ListField(read_only=True)
    portfolio = serializers.ListField(read_only=True)
    is_available = serializers.BooleanField(read_only=True)
    profile_status = serializers.CharField(read_only=True)
    admin_note = serializers.CharField(read_only=True, allow_null=True)
    submitted_at = serializers.DateTimeField(read_only=True)
    reviewed_at = serializers.DateTimeField(read_only=True, allow_null=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    def to_representation(self, instance):
        return {
            "id": str(instance.id),
            "user_id": str(instance.user_id),
            "user_email": instance.user.email,
            "user_name": instance.user.full_name,
            "slug": instance.slug,
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
            "rating": float(instance.rating),
            "review_count": instance.review_count,
            "total_sessions": instance.total_sessions,
            "total_earnings": instance.total_earnings,
            "pending_balance": instance.pending_balance,
            "profile_picture_url": instance.profile_picture_url,
            "linkedin_url": instance.linkedin_url,
            "portfolio_url": instance.portfolio_url,
            "certifications": instance.certifications,
            "portfolio": instance.portfolio,
            "is_available": instance.is_available,
            "profile_status": instance.profile_status,
            "admin_note": instance.admin_note,
            "submitted_at": instance.submitted_at,
            "reviewed_at": instance.reviewed_at,
            "created_at": instance.created_at,
            "updated_at": instance.updated_at,
        }


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
    expert_response_deadline = serializers.DateTimeField(
        read_only=True, allow_null=True
    )
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
