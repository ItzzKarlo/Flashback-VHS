import base64
import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone


SESSION_TTL_DAYS = 14


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def iso_now() -> str:
    return utc_now().isoformat()


def password_hash(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 210_000)
    return f"pbkdf2_sha256${base64.b64encode(salt).decode()}${base64.b64encode(digest).decode()}"


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        algorithm, salt_value, digest_value = stored_hash.split("$", maxsplit=2)
    except ValueError:
        return False

    if algorithm != "pbkdf2_sha256":
        return False

    salt = base64.b64decode(salt_value)
    expected = base64.b64decode(digest_value)
    actual = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 210_000)
    return hmac.compare_digest(actual, expected)


def new_session_token() -> str:
    return secrets.token_urlsafe(32)


def session_expires_at() -> str:
    return (utc_now() + timedelta(days=SESSION_TTL_DAYS)).isoformat()


def is_expired(iso_value: str) -> bool:
    try:
        expires_at = datetime.fromisoformat(iso_value)
    except ValueError:
        return True

    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    return expires_at <= utc_now()
