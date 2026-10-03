
from datetime import timedelta
from pathlib import Path

import environ


BASE_DIR = Path(__file__).resolve().parent.parent

env = environ.Env(
    DEBUG=(bool, False),
)
environ.Env.read_env(BASE_DIR / ".env")


SECRET_KEY = env("SECRET_KEY")

DEBUG = env("DEBUG")

ALLOWED_HOSTS = env.list("ALLOWED_HOSTS", default=["localhost", "127.0.0.1"])



INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt.token_blacklist',
    'django_filters',
    'drf_spectacular',
    'core',
    'accounts',
    'coaches',
    'plans',
    'discounts',
    'orders',
    'content',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
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

WSGI_APPLICATION = 'config.wsgi.application'

AUTH_USER_MODEL = "accounts.User"




DATABASES = {
    'default': env.db(
        "DATABASE_URL",
        default=f"sqlite:///{(BASE_DIR / 'db.sqlite3').as_posix()}",
    ),
}


REDIS_URL = env("REDIS_URL", default="redis://127.0.0.1:6379/0")

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": REDIS_URL,
        "KEY_PREFIX": "coach",
    }
}



AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]




LANGUAGE_CODE = 'fa-ir'

TIME_ZONE = env("TIME_ZONE", default="Asia/Tehran")

USE_I18N = True

USE_TZ = True



STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# User uploads (coach photos, certificates)
MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'


DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'



SPECTACULAR_SETTINGS = {
    "TITLE": "Coach API",
    "DESCRIPTION": "Online Coaching Platform API",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "ENUM_NAME_OVERRIDES": {
        "OrderStatusEnum": "orders.models.OrderStatus",
        "RevisionStatusEnum": "orders.models.RevisionRequest.Status",
    },
}

REST_FRAMEWORK = {
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "EXCEPTION_HANDLER": "core.exceptions.custom_exception_handler",
  
    "DEFAULT_PAGINATION_CLASS": "core.pagination.DefaultPagination",
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
   
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
}




SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=15),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=30),
    
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
}




CELERY_BROKER_URL = env("CELERY_BROKER_URL", default=REDIS_URL)
CELERY_TASK_ALWAYS_EAGER = env.bool("CELERY_TASK_ALWAYS_EAGER", default=False)
CELERY_TASK_IGNORE_RESULT = True
# If Redis is down, .delay() fails fast instead of hanging the request.
CELERY_BROKER_TRANSPORT_OPTIONS = {"max_retries": 2, "interval_start": 0, "interval_step": 0.5, "interval_max": 1}
CELERY_TIMEZONE = TIME_ZONE




SMS_BACKEND = env("SMS_BACKEND", default="accounts.sms.console.ConsoleSMSBackend")
KAVENEGAR_API_KEY = env("KAVENEGAR_API_KEY", default="")
KAVENEGAR_OTP_TEMPLATE = env("KAVENEGAR_OTP_TEMPLATE", default="verify")




OTP_TTL_SECONDS = 120         
OTP_MAX_ATTEMPTS = 5          
OTP_RESEND_SECONDS = 120      
OTP_PHONE_HOURLY_LIMIT = 5     
OTP_IP_HOURLY_LIMIT = 20       




LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "simple": {
            "format": "{asctime} [{levelname}] {name}: {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "simple",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
}
