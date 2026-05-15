import uuid

import factory
from factory.django import DjangoModelFactory

from users.models import User


class UserFactory(DjangoModelFactory):
    firebase_uid = factory.LazyFunction(lambda: uuid.uuid4().hex)
    email = factory.Sequence(lambda n: f"user{n}@example.com")
    full_name = factory.Faker("name")
    is_active = True

    class Meta:
        model = User
