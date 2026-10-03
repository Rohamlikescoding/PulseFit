from datetime import timedelta
from unittest import mock

import pytest
from django.utils import timezone

from accounts.models import OTPCode
from accounts.sms import locmem

pytestmark = [pytest.mark.django_db, pytest.mark.usefixtures("redis_required")]

PHONE = "09121234567"
REQUEST_URL = "/api/v1/auth/otp/request/"
VERIFY_URL = "/api/v1/auth/otp/verify/"


@pytest.fixture
def request_code(api_client, django_capture_on_commit_callbacks):
    """کد می‌خواهد و کد خام را از outbox پیامک برمی‌گرداند (تنها جایی که کد خام هست)."""

    def do(phone=PHONE, **extra):
        with django_capture_on_commit_callbacks(execute=True):
            response = api_client.post(REQUEST_URL, {"phone": phone}, format="json", **extra)
        assert response.status_code == 200, response.json()
        return locmem.outbox[-1]["code"]

    return do


def verify(api_client, code, phone=PHONE):
    return api_client.post(VERIFY_URL, {"phone": phone, "code": code}, format="json")


def wrong(code):
    return f"{(int(code) + 1) % 100000:05d}"


# ---------- P1-09: درخواست کد ----------

def test_request_response_has_no_code(api_client, django_capture_on_commit_callbacks):
    with django_capture_on_commit_callbacks(execute=True):
        response = api_client.post(REQUEST_URL, {"phone": "+989121234567"}, format="json")

    code = locmem.outbox[-1]["code"]
    assert response.status_code == 200
    assert response.json() == {"detail": "Code sent.", "expires_in": 120}
    assert code not in response.content.decode()
    assert locmem.outbox[-1]["phone"] == PHONE  # شماره نرمال شده


def test_raw_code_is_never_stored(request_code):
    code = request_code()
    otp = OTPCode.objects.get(phone=PHONE)
    assert all(code not in str(value) for value in OTPCode.objects.values().get(pk=otp.pk).values())
    assert len(otp.code_hash) == 64


def test_invalid_phone_rejected(api_client):
    response = api_client.post(REQUEST_URL, {"phone": "12345"}, format="json")
    assert response.status_code == 400
    assert "phone" in response.json()["errors"]


def test_sms_is_queued_not_sent_inside_request(api_client, django_capture_on_commit_callbacks):
    # P1-10: view نباید مستقیم پیامک بفرستد؛ فقط بعد از commit یک task در صف می‌گذارد.
    with mock.patch("accounts.services.otp.send_otp_sms.delay") as delay:
        with django_capture_on_commit_callbacks(execute=False) as callbacks:
            api_client.post(REQUEST_URL, {"phone": PHONE}, format="json")
        assert delay.call_count == 0          # هنوز commit نشده
        assert locmem.outbox == []            # هیچ پیامکی sync فرستاده نشد
        for callback in callbacks:
            callback()
    delay.assert_called_once()
    assert delay.call_args.args[0] == PHONE


def test_new_request_invalidates_previous_code(api_client, request_code, settings):
    settings.OTP_RESEND_SECONDS = 0  # برای این تست محدودیت ارسال مجدد را برداریم
    first = request_code()
    OTPCode.objects.update(created_at=timezone.now() - timedelta(seconds=10))
    second = request_code()
    if first == second:
        pytest.skip("random collision")
    assert verify(api_client, first).status_code == 400
    assert verify(api_client, second).status_code == 200


# ---------- rate limit ----------

def test_rate_limit_per_phone(api_client, request_code):
    request_code()
    response = api_client.post(REQUEST_URL, {"phone": PHONE}, format="json")
    assert response.status_code == 429
    assert response.json()["code"] == "throttled"


def test_rate_limit_per_ip(api_client, settings, django_capture_on_commit_callbacks):
    settings.OTP_IP_HOURLY_LIMIT = 3
    statuses = []
    for i in range(4):
        with django_capture_on_commit_callbacks(execute=True):
            r = api_client.post(REQUEST_URL, {"phone": f"0912000000{i}"}, format="json")
        statuses.append(r.status_code)
    assert statuses == [200, 200, 200, 429]


# ---------- P1-11: تأیید کد ----------

def test_verify_creates_new_user(api_client, request_code, django_user_model):
    code = request_code()
    response = verify(api_client, code)
    body = response.json()

    assert response.status_code == 200
    assert body["is_new_user"] is True
    assert body["access"] and body["refresh"]
    user = django_user_model.objects.get(phone=PHONE)
    assert user.role == django_user_model.Role.ATHLETE
    assert user.last_login is not None


def test_verify_existing_user(api_client, request_code, make_user):
    make_user(PHONE)
    response = verify(api_client, request_code())
    assert response.status_code == 200
    assert response.json()["is_new_user"] is False


def test_code_can_only_be_used_once(api_client, request_code):
    code = request_code()
    assert verify(api_client, code).status_code == 200
    response = verify(api_client, code)
    assert response.status_code == 400
    assert response.json()["code"] == "invalid_otp"


def test_expired_code_rejected(api_client, request_code):
    code = request_code()
    OTPCode.objects.update(expires_at=timezone.now() - timedelta(seconds=1))
    assert verify(api_client, code).status_code == 400


def test_five_wrong_attempts_lock_the_code(api_client, request_code):
    code = request_code()
    for _ in range(5):
        assert verify(api_client, wrong(code)).status_code == 400
    assert OTPCode.objects.get().attempts == 5
    # حالا حتی کد درست هم پذیرفته نمی‌شود.
    assert verify(api_client, code).status_code == 400


def test_four_wrong_attempts_then_correct_succeeds(api_client, request_code):
    code = request_code()
    for _ in range(4):
        verify(api_client, wrong(code))
    assert verify(api_client, code).status_code == 200


def test_verify_without_request(api_client):
    assert verify(api_client, "12345").status_code == 400


def test_verify_rejects_bad_code_format(api_client):
    response = verify(api_client, "12a45")
    assert response.status_code == 400
    assert "code" in response.json()["errors"]


def test_inactive_user_cannot_login(api_client, request_code, make_user):
    make_user(PHONE, is_active=False)
    response = verify(api_client, request_code())
    assert response.status_code == 403


def test_public_endpoints_ignore_broken_auth_header(api_client, request_code):
    api_client.credentials(HTTP_AUTHORIZATION="Bearer broken-token")
    request_code()
