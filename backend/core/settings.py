import os
from pathlib import Path
from urllib.parse import urlparse, parse_qsl
import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'dev-secret-key-change-me')
DEBUG = os.environ.get('DJANGO_DEV', 'False') == 'True'

tmpPostgres = urlparse(os.getenv("DATABASE_URL"))

DATABASES = {
    "default": dj_database_url.config(
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}",
        conn_max_age=600,      # keep connections open
        conn_health_checks=True
    )
}

if DEBUG:
    ALLOWED_HOSTS = ["http://localhost:8000", "localhost"]
    CSRF_TRUSTED_ORIGINS = ["http://localhost:8000"]

    # Development (filesystem)
    STATIC_URL = "/static/"
    STATIC_ROOT = BASE_DIR / "static"
    MEDIA_URL = "/media/"
    MEDIA_ROOT = BASE_DIR / "media"


else:
    ALLOWED_HOSTS = ["django-service-339934437429.us-central1.run.app"]
    CSRF_TRUSTED_ORIGINS = ["https://django-service-339934437429.us-central1.run.app"]

    DEFAULT_FILE_STORAGE = "storages.backends.gcloud.GoogleCloudStorage"
    GS_BUCKET_NAME = os.environ.get("GS_BUCKET_NAME")

    STATIC_URL = f"https://storage.googleapis.com/{GS_BUCKET_NAME}/static/"
    STATIC_ROOT = BASE_DIR / 'static'

    MEDIA_URL = f"https://storage.googleapis.com/{GS_BUCKET_NAME}/media/"
    MEDIA_ROOT = BASE_DIR / 'media'

    # Django ≥ 4.2 storage config
    STORAGES = {
        # User uploads (media)
        "default": {
            "BACKEND": "storages.backends.gcloud.GoogleCloudStorage",
            "OPTIONS": {
                "bucket_name": GS_BUCKET_NAME,
                # Put media under a prefix in the bucket:
                "location": "media",
                "querystring_auth": False,
            },
        },
        # Static files collected by `collectstatic`
        "staticfiles": {
            "BACKEND": "storages.backends.gcloud.GoogleCloudStorage",
            "OPTIONS": {
                "bucket_name": GS_BUCKET_NAME,
                # Put static under a prefix in the bucket:
                "location": "static",
                "querystring_auth": False,
            },
        },
    }


INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'resume',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'

AUTH_PASSWORD_VALIDATORS = []

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'America/Toronto'
USE_I18N = True
USE_TZ = True


CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    'http://127.0.0.1:3000',
    'http://localhost:3000',
]

REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ],
}
