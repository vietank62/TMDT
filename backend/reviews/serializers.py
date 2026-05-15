from rest_framework import serializers


class ReviewSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    booking_id = serializers.CharField()
    reviewer_id = serializers.CharField(read_only=True)
    expert_id = serializers.CharField(read_only=True)
    rating = serializers.IntegerField(min_value=1, max_value=5)
    comment = serializers.CharField()
    created_at = serializers.DateTimeField(read_only=True)
    is_public = serializers.BooleanField(default=True)
