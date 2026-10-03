import logging
from unittest import mock

import pytest

from accounts.services.otp import check_code, generate_code, hash_code
from accounts.sms import SMSError, get_sms_backend, locmem
from accounts.sms.console import ConsoleSMSBackend
from accounts.sms.kavenegar import KavenegarSMSBackend


# ---------- P1-08: تولید و hash ----------

def test_generate_code_is_five_digits():
    for _ in range(200):
        code = generate_code()
        assert len(code) == 5 and code.isdigit()


def test_generate_code_is_not_predictable():
    codes = {generate_code() for _ in range(200)}
    # از ۲۰۰ کد تصادفی از ۱۰۰ هزار حالت، تقریباً همه باید متفاوت باشند.
    assert len(codes) > 190


def test_hash_is_verifiable_and_bound_to_phone():
    h = hash_code("09121234567", "12345")
    assert h != "12345" and "12345" not in h
    assert check_code("09121234567", "12345", h)
    assert not check_code("09121234567", "12346", h)
    assert not check_code("09129999999", "12345", h)


def test_hash_depends_on_secret_key(settings):
    h1 = hash_code("09121234567", "12345")
    settings.SECRET_KEY = "another-secret"
    assert hash_code("09121234567", "12345") != h1


# ---------- P1-04: بک‌اندهای پیامک ----------

def test_console_backend_logs_message(caplog):
    with caplog.at_level(logging.INFO, logger="sms"):
        ConsoleSMSBackend().send_otp("09121234567", "54321")
    assert "09121234567" in caplog.text and "54321" in caplog.text


def test_get_sms_backend_uses_setting(settings):
    settings.SMS_BACKEND = "accounts.sms.console.ConsoleSMSBackend"
    assert isinstance(get_sms_backend(), ConsoleSMSBackend)


def test_locmem_backend_collects_outbox():
    get_sms_backend().send_otp("09121234567", "11111")
    assert locmem.outbox == [
        {"phone": "09121234567", "message": "کد ورود شما: 11111", "code": "11111"}
    ]


def test_kavenegar_requires_api_key(settings):
    settings.KAVENEGAR_API_KEY = ""
    with pytest.raises(SMSError):
        KavenegarSMSBackend()


def test_kavenegar_send_otp_uses_lookup_template(settings):
    settings.KAVENEGAR_API_KEY = "KEY"
    settings.KAVENEGAR_OTP_TEMPLATE = "login"
    fake = mock.Mock()
    fake.json.return_value = {"return": {"status": 200, "message": "ok"}}

    with mock.patch("accounts.sms.kavenegar.requests.post", return_value=fake) as post:
        KavenegarSMSBackend().send_otp("09121234567", "12345")

    url = post.call_args.args[0]
    assert url.endswith("/KEY/verify/lookup.json")
    assert post.call_args.kwargs["data"] == {
        "receptor": "09121234567",
        "token": "12345",
        "template": "login",
    }


def test_kavenegar_error_raises_sms_error(settings):
    settings.KAVENEGAR_API_KEY = "KEY"
    fake = mock.Mock()
    fake.json.return_value = {"return": {"status": 418, "message": "bad"}}
    with mock.patch("accounts.sms.kavenegar.requests.post", return_value=fake):
        with pytest.raises(SMSError):
            KavenegarSMSBackend().send_otp("09121234567", "12345")
