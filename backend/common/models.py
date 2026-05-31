import uuid

from django.db import models
from django.utils import timezone


class MSSQLUUIDField(models.UUIDField):
    """
    UUIDField that always passes UUID values to the database as a
    dashed string (e.g. '550e8400-e29b-41d4-a716-446655440000').

    mssql-django sets has_native_uuid_field = False, which makes
    Django call value.hex (no dashes). SQL Server UNIQUEIDENTIFIER
    rejects that format; it requires dashes.  This subclass overrides
    get_db_prep_value to return str(value) instead.
    """

    def get_db_prep_value(self, value, connection, prepared=False):
        value = super().get_db_prep_value(value, connection, prepared=prepared)
        if value is None:
            return value
        # str(uuid.UUID(...)) always produces the dashed format.
        return (
            str(uuid.UUID(str(value)))
            if not isinstance(value, uuid.UUID)
            else str(value)
        )


class UUIDModel(models.Model):
    id = MSSQLUUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        abstract = True


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class SoftDeleteQuerySet(models.QuerySet):
    def delete(self):
        return self.update(deleted_at=timezone.now())

    def hard_delete(self):
        return super().delete()

    def alive(self):
        return self.filter(deleted_at__isnull=True)

    def dead(self):
        return self.exclude(deleted_at__isnull=True)


class SoftDeleteManager(models.Manager):
    def get_queryset(self):
        return SoftDeleteQuerySet(self.model, using=self._db).alive()


class SoftDeleteModel(models.Model):
    deleted_at = models.DateTimeField(null=True, blank=True, db_index=True)

    objects = SoftDeleteManager()
    all_objects = models.Manager()

    def delete(self, using=None, keep_parents=False):
        self.deleted_at = timezone.now()
        self.save(update_fields=["deleted_at"])

    def hard_delete(self):
        super().delete()

    @property
    def is_deleted(self) -> bool:
        return self.deleted_at is not None

    class Meta:
        abstract = True
