import logging

from django.core.exceptions import PermissionDenied
from django.http import Http404
from rest_framework import exceptions
from rest_framework.response import Response
from rest_framework.views import (
    exception_handler as drf_exception_handler,
    set_rollback,
)

logger = logging.getLogger("api.exceptions")


def custom_exception_handler(exc, context):
    """
    همهٔ خطاهای API را به یک قالب ثابت تبدیل می‌کند:
        {"detail": "...", "code": "...", "errors": ... | null}
    """
    response = drf_exception_handler(exc, context)

    if response is None:
        # خطای غیرمنتظره: جزئیات داخلی را به client نده.
        # تراکنش باز را rollback کن تا داده‌ی نیمه‌کاره ذخیره نشود.
        set_rollback()
        view = context.get("view")
        logger.error(
            "Unhandled API exception in %s",
            view.__class__.__name__ if view else None,
            exc_info=(type(exc), exc, exc.__traceback__),
        )

        return Response(
            {
                "detail": "An unexpected error occurred.",
                "code": "internal_error",
                "errors": None,
            },
            status=500,
        )

    # DRF خطاهای خود Django (Http404 و PermissionDenied) را هم پاسخ می‌دهد،
    # ولی exc همان کلاس Django می‌ماند؛ برای گرفتن code درست تبدیلش می‌کنیم.
    if isinstance(exc, Http404):
        exc = exceptions.NotFound()
    elif isinstance(exc, PermissionDenied):
        exc = exceptions.PermissionDenied()

    error_code = getattr(exc, "default_code", "error")
    data = response.data

    if isinstance(data, dict) and set(data) == {"detail"}:
        # خطاهای ساده مثل 404 یا 401: پیام اصلی را نگه دار.
        detail = str(data["detail"])
        errors = None
    elif isinstance(exc, exceptions.ValidationError):
        detail = "Validation failed."
        errors = data
    else:
        detail = "Request failed."
        errors = data

    response.data = {
        "detail": detail,
        "code": str(error_code),
        "errors": errors,
    }

    return response
