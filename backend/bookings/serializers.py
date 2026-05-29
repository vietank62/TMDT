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
    agora_channel = serializers.CharField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    def to_representation(self, instance):
        return {
            "id": str(instance.id),
            "user_id": str(instance.user_id),
            "expert_id": str(instance.expert_id),
            "slot_ids": [
                str(booking_slot.slot_id) for booking_slot in instance.booking_slots.all()
            ],
            "status": instance.status,
            "problem_description": instance.problem_description,
            "session_goals": instance.session_goals,
            "documents": instance.document_urls,
            "scheduled_at": instance.scheduled_at,
            "duration_minutes": instance.duration_minutes,
            "price_vnd": instance.price_vnd,
            "payment_deadline": instance.payment_deadline,
            "rejection_reason": instance.rejection_reason,
            "expert_note": instance.expert_note,
            "agora_channel": instance.agora_channel,
            "created_at": instance.created_at,
            "updated_at": instance.updated_at,
        }


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
