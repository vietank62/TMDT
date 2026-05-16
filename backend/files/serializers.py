from rest_framework import serializers

from files.models import UploadedFile

_PURPOSE_CHOICES = [choice[0] for choice in UploadedFile.PURPOSE_CHOICES]


class GenerateUploadUrlRequestSerializer(serializers.Serializer):
    filename = serializers.CharField(max_length=255)
    content_type = serializers.CharField(max_length=100)
    size_bytes = serializers.IntegerField(min_value=1)
    purpose = serializers.ChoiceField(choices=_PURPOSE_CHOICES)


class RequiredHeadersSerializer(serializers.Serializer):
    x_ms_blob_type = serializers.CharField(source="x-ms-blob-type", read_only=True)
    content_type = serializers.CharField(source="Content-Type", read_only=True)


class GenerateUploadUrlResponseSerializer(serializers.Serializer):
    file_id = serializers.UUIDField(read_only=True)
    upload_url = serializers.URLField(read_only=True)
    blob_path = serializers.CharField(read_only=True)
    expires_at = serializers.DateTimeField(read_only=True)
    required_headers = serializers.DictField(child=serializers.CharField(), read_only=True)


class ConfirmUploadRequestSerializer(serializers.Serializer):
    file_id = serializers.UUIDField()
    size_bytes = serializers.IntegerField(min_value=1)


class FileUploadSerializer(serializers.ModelSerializer):
    file_id = serializers.UUIDField(source="id", read_only=True)
    original_name = serializers.CharField(source="original_filename", read_only=True)
    size = serializers.IntegerField(source="size_bytes", read_only=True)
    category = serializers.CharField(source="purpose", read_only=True)
    url = serializers.SerializerMethodField()
    uploaded_at = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = UploadedFile
        fields = [
            "file_id",
            "original_name",
            "content_type",
            "size",
            "category",
            "url",
            "uploaded_at",
        ]

    def get_url(self, obj: UploadedFile) -> str | None:
        return obj.blob_url if obj.is_public and obj.blob_url else None
