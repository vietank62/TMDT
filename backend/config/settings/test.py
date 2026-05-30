"""Test-only settings — forces SQLite so tests run without ODBC/MSSQL drivers."""

from .base import *  # noqa: F401, F403

# Override whatever DB_ENGINE is in .env
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
    }
}

# Skip Firebase initialisation during tests
FIREBASE_CREDENTIALS_JSON = ""
FIREBASE_CREDENTIALS_PATH = ""

# Remove middleware that aren't installed locally and override static-file storage
STORAGES = {
    "staticfiles": {
        "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
    },
}

# Remove middleware that aren't installed locally
MIDDLEWARE = [m for m in MIDDLEWARE if "whitenoise" not in m]  # noqa: F405

# Silence logging noise
LOGGING["loggers"]["django.db.backends"] = {  # noqa: F405  # type: ignore[index]
    "handlers": [],
    "level": "CRITICAL",
    "propagate": False,
}
