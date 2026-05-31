from rest_framework import serializers


class PaymentSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    booking_id = serializers.CharField(read_only=True)
    user_id = serializers.CharField(read_only=True)
    expert_id = serializers.CharField(read_only=True)
    amount = serializers.IntegerField(read_only=True)
    status = serializers.CharField(read_only=True)
    sepay_order_id = serializers.CharField(read_only=True)
    sepay_transaction_id = serializers.CharField(read_only=True)
    sepay_qr_code = serializers.CharField(read_only=True, allow_null=True)
    bank_account = serializers.DictField(read_only=True, allow_null=True)
    transfer_code = serializers.CharField(read_only=True, allow_null=True)
    paid_at = serializers.DateTimeField(read_only=True, allow_null=True)
    refund_amount = serializers.IntegerField(read_only=True)
    refunded_at = serializers.DateTimeField(read_only=True, allow_null=True)
    created_at = serializers.DateTimeField(read_only=True)
    expires_at = serializers.DateTimeField(read_only=True, allow_null=True)


class PaymentCheckSerializer(serializers.Serializer):
    success = serializers.BooleanField(read_only=True)
    paid = serializers.BooleanField(read_only=True)
    status = serializers.CharField(read_only=True)


class SEPayWebhookSerializer(serializers.Serializer):
    id = serializers.CharField()
    gateway = serializers.CharField(required=False, allow_blank=True)
    transactionDate = serializers.DateTimeField()
    accountNumber = serializers.CharField(required=False, allow_blank=True)
    subAccount = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    code = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    content = serializers.CharField(required=False, allow_blank=True)
    transferType = serializers.CharField()
    description = serializers.CharField(required=False, allow_blank=True)
    transferAmount = serializers.IntegerField(min_value=0)
    accumulated = serializers.IntegerField(required=False)
    referenceCode = serializers.CharField(required=False, allow_blank=True, allow_null=True)


class WebhookResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField(read_only=True)
    message = serializers.CharField(read_only=True)


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
