from rest_framework import serializers


class PresignedUrlRequestSerializer(serializers.Serializer):
    filename = serializers.CharField()
    content_type = serializers.CharField()
    purpose = serializers.ChoiceField(choices=["booking_document", "expert_certificate", "avatar"])
    size_bytes = serializers.IntegerField(required=False)


class PresignedUrlResponseSerializer(serializers.Serializer):
    upload_url = serializers.URLField(read_only=True)
    file_id = serializers.CharField(read_only=True)
    expires_at = serializers.DateTimeField(read_only=True)


class ConfirmUploadSerializer(serializers.Serializer):
    file_id = serializers.CharField()


class UploadedFileSerializer(serializers.Serializer):
    file_id = serializers.CharField(read_only=True)
    url = serializers.URLField(read_only=True)
    name = serializers.CharField(read_only=True)
    size = serializers.IntegerField(read_only=True)
    content_type = serializers.CharField(read_only=True)
