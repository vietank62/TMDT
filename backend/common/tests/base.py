from django.test import TestCase
from rest_framework.test import APIClient, APITestCase

from users.tests.factories import UserFactory


class BaseTestCase(TestCase):
    pass


class BaseAPITestCase(APITestCase):
    def setUp(self):
        super().setUp()
        self.client = APIClient()

    def authenticate(self, user=None):
        if user is None:
            user = UserFactory()
        self.client.force_authenticate(user=user)
        return user
