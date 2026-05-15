import hashlib
import hmac
import time
from typing import Any


def generate_agora_token(
    app_id: str,
    app_certificate: str,
    channel_name: str,
    uid: int,
    role: int = 1,
    expiration_seconds: int = 3600,
) -> str:
    """Generate an Agora RTC token (AccessToken2 format)."""
    try:
        from agora_token_builder import RtcTokenBuilder  # type: ignore[import]

        expire_at = int(time.time()) + expiration_seconds
        return RtcTokenBuilder.buildTokenWithUid(
            app_id, app_certificate, channel_name, uid, role, expire_at
        )
    except ImportError:
        raise RuntimeError(
            "agora_token_builder is not installed. "
            "Add it to requirements.txt to enable Agora token generation."
        )


def format_vnd(amount: int) -> str:
    """Format an integer VND amount with Vietnamese locale style."""
    return f"{amount:,.0f}".replace(",", ".") + " ₫"


def compute_hmac_sha256(secret: str, message: str) -> str:
    return hmac.new(secret.encode(), message.encode(), hashlib.sha256).hexdigest()


def deep_merge(base: dict[str, Any], override: dict[str, Any]) -> dict[str, Any]:
    result = base.copy()
    for key, value in override.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = deep_merge(result[key], value)
        else:
            result[key] = value
    return result
