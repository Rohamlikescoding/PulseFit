from decimal import Decimal, ROUND_HALF_UP

from .redis_client import redis_client

# ارقام فارسی و عربی → ارقام انگلیسی
_DIGITS_TRANSLATION = str.maketrans(
    "۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩",
    "01234567890123456789",
)


def money_round(value) -> Decimal:
    """گرد کردن مبلغ به عدد صحیح (ریال/تومان)، نیم به بالا."""
    # str() باعث می‌شود float مثل 2.675 دقیقاً همان‌طور که نوشته شده تبدیل شود.
    return Decimal(str(value)).quantize(
        Decimal("1"),
        rounding=ROUND_HALF_UP,
    )


def normalize_phone(phone: str) -> str:
    """
    شمارهٔ موبایل ایران را به فرمت 09xxxxxxxxx تبدیل می‌کند.
    ورودی‌های قابل قبول: 09..., 9..., +989..., 00989..., 989... و ارقام فارسی/عربی.
    """
    if not phone or not isinstance(phone, str):
        raise ValueError("شماره تلفن نمی‌تواند خالی باشد.")

    cleaned = "".join(
        char for char in phone.strip().translate(_DIGITS_TRANSLATION)
        if char in "0123456789+"
    )

    if cleaned.startswith("+98"):
        cleaned = "0" + cleaned[3:]
    elif cleaned.startswith("0098"):
        cleaned = "0" + cleaned[4:]
    elif cleaned.startswith("98") and len(cleaned) == 12:
        cleaned = "0" + cleaned[2:]
    elif cleaned.startswith("9") and len(cleaned) == 10:
        cleaned = "0" + cleaned

    if not (cleaned.startswith("09") and len(cleaned) == 11 and cleaned.isdigit()):
        raise ValueError(
            f"شماره موبایل نامعتبر است: {phone}. "
            "فرمت صحیح: 09xxxxxxxxx"
        )

    return cleaned


def set_cache_value(key, value, ttl=60):
    redis_client.set(key, value, ex=ttl)


def get_cache_value(key):
    return redis_client.get(key)


def increment_counter(key, ttl=60) -> int:
    """
    شمارنده با پنجرهٔ زمانی ثابت (مثلاً برای rate limit).
    اولین افزایش کلید را با انقضای ttl می‌سازد و بقیه فقط زیادش می‌کنند.
    هر دو دستور در یک تراکنش (MULTI/EXEC) اجرا می‌شوند، پس اتمیک است.
    """
    with redis_client.pipeline(transaction=True) as pipe:
        pipe.set(key, 0, ex=ttl, nx=True)
        pipe.incr(key)
        _, value = pipe.execute()
    return value
