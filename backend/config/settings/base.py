from pathlib import Path

import environ

BASE_DIR = Path(__file__).resolve().parent.parent.parent

env = environ.Env(
    DEBUG=(bool, False),
)

environ.Env.read_env(BASE_DIR / ".env")

SECRET_KEY = env("SECRET_KEY", default="insecure-dev-key-do-not-use-in-production")
DEBUG = env("DEBUG")
ALLOWED_HOSTS = env.list("ALLOWED_HOSTS", default=["localhost", "127.0.0.1"])

DJANGO_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

THIRD_PARTY_APPS = [
    "rest_framework",
    "drf_spectacular",
    "corsheaders",
    "django_filters",
    "storages",
]

LOCAL_APPS = [
    "common",
    "users",
    "experts",
    "bookings",
    "payments",
    "reviews",
    "notifications",
    "files",
    "admin_panel",
    "audit_logs",
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

_db_engine = env("DB_ENGINE", default="sqlite3")

if _db_engine == "mssql":
    DATABASES = {
        "default": {
            "ENGINE": "mssql",
            "NAME": env("DB_NAME"),
            "USER": env("DB_USER"),
            "PASSWORD": env("DB_PASSWORD"),
            "HOST": env("DB_HOST"),
            "PORT": env("DB_PORT", default="1433"),
            "OPTIONS": {
                "driver": "ODBC Driver 18 for SQL Server",
                "extra_params": "Encrypt=yes;TrustServerCertificate=no",
            },
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

AUTH_USER_MODEL = "users.User"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "vi"
TIME_ZONE = "Asia/Ho_Chi_Minh"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

MIGRATION_MODULES = {
    # Django built-ins — tables already created by 01-init.sql
    "contenttypes": None,
    "auth": None,
    "admin": None,
    "sessions": None,
    # Custom apps
    "common": None,
    "users": None,
    "experts": None,
    "bookings": None,
    "payments": None,
    "reviews": None,
    "notifications": None,
    "files": None,
    "admin_panel": None,
    "audit_logs": None,
}

# Django REST Framework
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "common.authentication.FirebaseAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_PAGINATION_CLASS": "common.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.OrderingFilter",
        "rest_framework.filters.SearchFilter",
    ],
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "EXCEPTION_HANDLER": "common.exceptions.custom_exception_handler",
}

# drf-spectacular
SPECTACULAR_SETTINGS = {
    "TITLE": "MicroMentor API",
    "DESCRIPTION": "REST API for the MicroMentor platform",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
}

# CORS
CORS_ALLOWED_ORIGINS = env.list(
    "CORS_ALLOWED_ORIGINS", default=["http://localhost:3000"]
)

# Firebase — use FIREBASE_CREDENTIALS_JSON in production (container env var),
# FIREBASE_CREDENTIALS_PATH for local dev (points to certs/ file).
FIREBASE_CREDENTIALS_JSON = env("FIREBASE_CREDENTIALS_JSON", default="")
FIREBASE_CREDENTIALS_PATH = env("FIREBASE_CREDENTIALS_PATH", default="")

# Azure Blob Storage
AZURE_ACCOUNT_NAME = env("AZURE_ACCOUNT_NAME", default="")
AZURE_ACCOUNT_KEY = env("AZURE_ACCOUNT_KEY", default="")
AZURE_CONTAINER_PUBLIC = env("AZURE_CONTAINER_PUBLIC", default="public")
AZURE_CONTAINER_PRIVATE = env("AZURE_CONTAINER_PRIVATE", default="private")

# Agora
AGORA_APP_ID = env("AGORA_APP_ID", default="")
AGORA_APP_CERTIFICATE = env("AGORA_APP_CERTIFICATE", default="")

# SEPay
SEPAY_MERCHANT_ID = env("SEPAY_MERCHANT_ID", default="")
SEPAY_MERCHANT_SECRET_KEY = env("SEPAY_MERCHANT_SECRET_KEY", default="")

# Logging
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "{levelname} {asctime} {module} {process:d} {thread:d} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "WARNING",
    },
    "loggers": {
        "micromentor": {
            "handlers": ["console"],
            "level": "DEBUG",
            "propagate": False,
        },
        "django": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },
    },
}
