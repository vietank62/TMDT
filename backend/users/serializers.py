from rest_framework import serializers

from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "firebase_uid",
            "email",
            "full_name",
            "avatar_url",
            "phone_number",
            "bio",
            "timezone",
            "profile_completed",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "firebase_uid", "email", "created_at", "updated_at"]


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["full_name", "avatar_url", "phone_number", "bio", "timezone"]
