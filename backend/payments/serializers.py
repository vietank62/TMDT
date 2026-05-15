from rest_framework import serializers


class PaymentSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    booking_id = serializers.CharField(read_only=True)
    user_id = serializers.CharField(read_only=True)
    expert_id = serializers.CharField(read_only=True)
    amount = serializers.IntegerField(read_only=True)
    status = serializers.CharField(read_only=True)
    sepay_qr_code = serializers.CharField(read_only=True, allow_null=True)
    bank_account = serializers.DictField(read_only=True, allow_null=True)
    transfer_code = serializers.CharField(read_only=True, allow_null=True)
    paid_at = serializers.DateTimeField(read_only=True, allow_null=True)
    created_at = serializers.DateTimeField(read_only=True)
    expires_at = serializers.DateTimeField(read_only=True, allow_null=True)


class RefundSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    booking_id = serializers.CharField(read_only=True)
    payment_id = serializers.CharField(read_only=True)
    user_id = serializers.CharField(read_only=True)
    amount = serializers.IntegerField(read_only=True)
    reason = serializers.CharField(read_only=True)
    status = serializers.CharField(read_only=True)
    requested_at = serializers.DateTimeField(read_only=True)
    processed_at = serializers.DateTimeField(read_only=True, allow_null=True)
    admin_note = serializers.CharField(read_only=True, allow_null=True)
