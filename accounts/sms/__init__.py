from django.conf import settings
from django.utils.module_loading import import_string

from .base import BaseSMSBackend, SMSError

__all__ = ["BaseSMSBackend", "SMSError", "get_sms_backend"]


def get_sms_backend() -> BaseSMSBackend:
    """
    بک‌اند پیامک را از تنظیم SMS_BACKEND می‌سازد (مثل EMAIL_BACKEND در Django).
    هر بار settings خوانده می‌شود تا تست‌ها بتوانند آن را عوض کنند.
    """
    return import_string(settings.SMS_BACKEND)()
