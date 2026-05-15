from rest_framework import serializers


class BookingSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    user_id = serializers.CharField(read_only=True)
    expert_id = serializers.CharField(read_only=True)
    slot_ids = serializers.ListField(child=serializers.CharField(), min_length=2)
    status = serializers.CharField(read_only=True)
    problem_description = serializers.CharField()
    session_goals = serializers.CharField()
    documents = serializers.ListField(read_only=True)
    scheduled_at = serializers.DateTimeField(read_only=True)
    duration_minutes = serializers.IntegerField(read_only=True)
    price_vnd = serializers.IntegerField(read_only=True)
    payment_deadline = serializers.DateTimeField(read_only=True, allow_null=True)
    rejection_reason = serializers.CharField(read_only=True, allow_null=True)
    expert_note = serializers.CharField(read_only=True, allow_null=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)


class CreateBookingSerializer(serializers.Serializer):
    expert_id = serializers.CharField()
    slot_ids = serializers.ListField(child=serializers.CharField(), min_length=2)
    problem_description = serializers.CharField()
    session_goals = serializers.CharField()
    document_urls = serializers.ListField(
        child=serializers.URLField(), required=False, default=list
    )


class ApproveBookingSerializer(serializers.Serializer):
    expert_note = serializers.CharField(required=False)


class RejectBookingSerializer(serializers.Serializer):
    rejection_reason = serializers.CharField()


class CancelBookingSerializer(serializers.Serializer):
    reason = serializers.CharField(required=False)


class SessionTokenSerializer(serializers.Serializer):
    token = serializers.CharField(read_only=True)
    channel = serializers.CharField(read_only=True)
    uid = serializers.IntegerField(read_only=True)
    app_id = serializers.CharField(read_only=True)
