import os
from dotenv import load_dotenv
from .base import *

load_dotenv()

DEBUG = False

ALLOWED_HOSTS = []

SECURE_CROSS_ORIGIN_OPENER_POLICY = None

WSGI_APPLICATION = "webstorage.wsgi.application"

SECRET_KEY = os.getenv("SECRET_KEY")

STATIC_URL = "static/"
STATICFILES_DIRS = [os.path.join(BASE_DIR, "build/static")]
STATIC_ROOT = "/var/www/html/static"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("DB_NAME"),
        "USER": os.getenv("DB_USER"),
        "PASSWORD": os.getenv("DB_PASSWORD"),
        "HOST": "localhost",
    }
}
