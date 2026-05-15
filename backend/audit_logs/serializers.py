from rest_framework import serializers


class AuditLogSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    action = serializers.CharField(read_only=True)
    actor_id = serializers.CharField(read_only=True)
    actor_role = serializers.CharField(read_only=True)
    target_type = serializers.CharField(read_only=True)
    target_id = serializers.CharField(read_only=True)
    previous_state = serializers.DictField(read_only=True, allow_null=True)
    new_state = serializers.DictField(read_only=True, allow_null=True)
    note = serializers.CharField(read_only=True, allow_null=True)
    created_at = serializers.DateTimeField(read_only=True)
