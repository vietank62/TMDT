from rest_framework import serializers

from common.permissions import get_user_roles

from .models import User


class UserSerializer(serializers.ModelSerializer):
    roles = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "firebase_uid",
            "email",
            "roles",
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

    def get_roles(self, obj):
        return get_user_roles(obj)


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["full_name", "avatar_url", "phone_number", "bio", "timezone"]
