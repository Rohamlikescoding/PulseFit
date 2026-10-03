import hashlib
import hmac
import secrets
from datetime import timedelta

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from django.db.models import F
from django.utils import timezone
from rest_framework.exceptions import Throttled

from core.utils import increment_counter

from ..exceptions import InvalidOTP
from ..models import OTPCode
from ..tasks import send_otp_sms

OTP_LENGTH = 5



def generate_code() -> str:
    return f"{secrets.randbelow(10 ** OTP_LENGTH):0{OTP_LENGTH}d}"


def hash_code(phone: str, code: str) -> str:
  
    message = f"{phone}:{code}".encode()
    return hmac.new(settings.SECRET_KEY.encode(), message, hashlib.sha256).hexdigest()


def check_code(phone: str, code: str, code_hash: str) -> bool:
    return hmac.compare_digest(hash_code(phone, code), code_hash)


# ---------- rate limit ----------

def _limit(key: str, limit: int, window: int) -> None:
    if window <= 0:
        return
    if increment_counter(key, ttl=window) > limit:
        raise Throttled(wait=window)


def check_rate_limits(phone: str, ip: str | None) -> None:
    if ip:
        _limit(f"otp:rl:ip:{ip}", settings.OTP_IP_HOURLY_LIMIT, 3600)
    _limit(f"otp:rl:phone:{phone}:resend", 1, settings.OTP_RESEND_SECONDS)
    _limit(f"otp:rl:phone:{phone}:hour", settings.OTP_PHONE_HOURLY_LIMIT, 3600)



def request_otp(phone: str, ip: str | None) -> int:
  
    check_rate_limits(phone, ip)

    code = generate_code()
    with transaction.atomic():
        OTPCode.objects.filter(phone=phone, is_used=False).update(is_used=True)
        OTPCode.objects.create(
            phone=phone,
            code_hash=hash_code(phone, code),
            expires_at=timezone.now() + timedelta(seconds=settings.OTP_TTL_SECONDS),
        )
        transaction.on_commit(lambda: send_otp_sms.delay(phone, code))

    return settings.OTP_TTL_SECONDS



def verify_otp(phone: str, code: str):
   
    otp = (
        OTPCode.objects.filter(phone=phone, is_used=False)
        .order_by("-created_at", "-id")
        .first()
    )
    if otp is None or otp.is_expired or otp.attempts >= settings.OTP_MAX_ATTEMPTS:
        raise InvalidOTP()

    if not check_code(phone, code, otp.code_hash):
        OTPCode.objects.filter(pk=otp.pk).update(attempts=F("attempts") + 1)
        raise InvalidOTP()


    updated = OTPCode.objects.filter(
        pk=otp.pk,
        is_used=False,
        attempts__lt=settings.OTP_MAX_ATTEMPTS,
        expires_at__gt=timezone.now(),
    ).update(is_used=True)
    if updated != 1:
        raise InvalidOTP()

    return _get_or_create_user(phone)


def _get_or_create_user(phone: str):
    User = get_user_model()
    user = User.objects.filter(phone=phone).first()
    if user is not None:
        return user, False
    try:
        return User.objects.create_user(phone=phone), True
    except IntegrityError:
        return User.objects.get(phone=phone), False
