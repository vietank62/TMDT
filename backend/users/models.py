import uuid

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models

from common.models import TimeStampedModel


class UserManager(BaseUserManager):
    def create_user(self, firebase_uid: str, email: str, **extra_fields):
        if not firebase_uid:
            raise ValueError("firebase_uid is required")
        email = self.normalize_email(email)
        user = self.model(firebase_uid=firebase_uid, email=email, **extra_fields)
        user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, firebase_uid: str, email: str, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(firebase_uid, email, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin, TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    firebase_uid = models.CharField(max_length=128, unique=True, db_index=True)
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255, blank=True)
    avatar_url = models.URLField(blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    bio = models.TextField(blank=True)
    timezone = models.CharField(max_length=64, default="Asia/Ho_Chi_Minh")
    profile_completed = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["firebase_uid"]

    class Meta:
        db_table = "users"

    def __str__(self) -> str:
        return self.email
