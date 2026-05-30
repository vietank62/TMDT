from .base import *  # noqa: F401, F403

DEBUG = True

INSTALLED_APPS += ["django.contrib.admindocs"]  # noqa: F405

# Relax host checking locally
ALLOWED_HOSTS = ["*"]

# No SSL enforcement in local / containerised-dev environments
SECURE_SSL_REDIRECT = False
SECURE_HSTS_SECONDS = 0
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False

# Echo SQL queries to console in local dev
LOGGING["loggers"]["django.db.backends"] = {  # noqa: F405  # type: ignore[index]
    "handlers": ["console"],
    "level": "DEBUG",
    "propagate": False,
}
