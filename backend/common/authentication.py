import logging

import firebase_admin
from django.conf import settings
from django.contrib.auth import get_user_model
from firebase_admin import auth as firebase_auth
from firebase_admin import credentials
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

logger = logging.getLogger("micromentor")

User = get_user_model()

_firebase_app = None


def _get_firebase_app() -> firebase_admin.App:
    global _firebase_app
    if _firebase_app is None:
        cred_json: str = getattr(settings, "FIREBASE_CREDENTIALS_JSON", "")
        cred_path: str = getattr(settings, "FIREBASE_CREDENTIALS_PATH", "")

        if cred_json:
            # Production path: full JSON stored as a secret environment variable.
            # The value may be plain JSON or base64-encoded JSON.
            import base64
            import json

            try:
                service_account = json.loads(base64.b64decode(cred_json).decode())
            except Exception:
                service_account = json.loads(cred_json)
            cred = credentials.Certificate(service_account)
        elif cred_path:
            # Local dev path: point FIREBASE_CREDENTIALS_PATH at the JSON file.
            cred = credentials.Certificate(cred_path)
        else:
            # Fallback: Application Default Credentials (GCP / Workload Identity).
            cred = credentials.ApplicationDefault()

        _firebase_app = firebase_admin.initialize_app(cred)
    return _firebase_app


class FirebaseAuthentication(BaseAuthentication):
    """Verify Firebase ID tokens and resolve/create local User records."""

    def authenticate_header(self, request):
        return 'Bearer realm="api"'

    def authenticate(self, request):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return None

        id_token = auth_header.split(" ", 1)[1].strip()
        if not id_token:
            return None

        try:
            _get_firebase_app()
            decoded = firebase_auth.verify_id_token(id_token)
        except firebase_admin.exceptions.FirebaseError as exc:
            logger.warning("Firebase token verification failed: %s", exc)
            raise AuthenticationFailed("Invalid or expired Firebase token.") from exc

        user = self._get_or_create_user(decoded)
        return user, decoded

    def _get_or_create_user(self, decoded_token: dict) -> User:
        uid = decoded_token["uid"]
        email = decoded_token.get("email", "")
        name = decoded_token.get("name", "")
        picture = decoded_token.get("picture", "")

        user, created = User.objects.get_or_create(
            firebase_uid=uid,
            defaults={
                "email": email,
                "full_name": name,
                "avatar_url": picture,
            },
        )

        if not created:
            changed = False
            if email and user.email != email:
                user.email = email
                changed = True
            if changed:
                user.save(update_fields=["email"])

        return user
