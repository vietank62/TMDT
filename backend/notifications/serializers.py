from rest_framework import serializers


class NotificationSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    user_id = serializers.CharField(read_only=True)
    type = serializers.CharField(read_only=True)
    title = serializers.CharField(read_only=True)
    message = serializers.CharField(read_only=True)
    is_read = serializers.BooleanField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    related_booking_id = serializers.CharField(read_only=True, allow_null=True)
