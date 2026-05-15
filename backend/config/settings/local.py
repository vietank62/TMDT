from .base import *  # noqa: F401, F403

DEBUG = True

INSTALLED_APPS += ["django.contrib.admindocs"]  # noqa: F405

# Relax host checking locally
ALLOWED_HOSTS = ["*"]

# Echo SQL queries to console in local dev
LOGGING["loggers"]["django.db.backends"] = {  # noqa: F405
    "handlers": ["console"],
    "level": "DEBUG",
    "propagate": False,
}
