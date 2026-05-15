from rest_framework import serializers


class AdminSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    firebase_uid = serializers.CharField(read_only=True)
    email = serializers.EmailField(read_only=True)
    full_name = serializers.CharField()
    avatar_url = serializers.URLField(required=False, allow_null=True)
    roles = serializers.ListField(child=serializers.CharField(), read_only=True)
    created_at = serializers.DateTimeField(read_only=True)


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
