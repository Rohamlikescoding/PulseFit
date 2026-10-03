from datetime import timedelta

import pytest
from rest_framework_simplejwt.settings import api_settings
from rest_framework_simplejwt.tokens import RefreshToken

pytestmark = pytest.mark.django_db

REFRESH_URL = "/api/v1/auth/token/refresh/"
LOGOUT_URL = "/api/v1/auth/logout/"
ME_URL = "/api/v1/me/"


def tokens_for(user):
    refresh = RefreshToken.for_user(user)
    return str(refresh.access_token), str(refresh)


def test_jwt_lifetimes():
    assert api_settings.ACCESS_TOKEN_LIFETIME == timedelta(minutes=15)
    assert api_settings.REFRESH_TOKEN_LIFETIME == timedelta(days=30)
    assert api_settings.ROTATE_REFRESH_TOKENS and api_settings.BLACKLIST_AFTER_ROTATION


def test_access_token_authenticates(api_client, athlete):
    access, _ = tokens_for(athlete)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
    assert api_client.get(ME_URL).status_code == 200


def test_refresh_rotation_blacklists_old_token(api_client, athlete):
    _, refresh = tokens_for(athlete)

    response = api_client.post(REFRESH_URL, {"refresh": refresh}, format="json")
    assert response.status_code == 200
    new_refresh = response.json()["refresh"]
    assert new_refresh != refresh

    # توکن قدیمی بعد از rotation در blacklist است.
    reused = api_client.post(REFRESH_URL, {"refresh": refresh}, format="json")
    assert reused.status_code == 401

    # توکن جدید کار می‌کند.
    assert api_client.post(REFRESH_URL, {"refresh": new_refresh}, format="json").status_code == 200


def test_logout_invalidates_refresh_token(api_client, athlete):
    access, refresh = tokens_for(athlete)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

    assert api_client.post(LOGOUT_URL, {"refresh": refresh}, format="json").status_code == 204

    api_client.credentials()
    assert api_client.post(REFRESH_URL, {"refresh": refresh}, format="json").status_code == 401


def test_logout_requires_authentication(api_client, athlete):
    _, refresh = tokens_for(athlete)
    assert api_client.post(LOGOUT_URL, {"refresh": refresh}, format="json").status_code == 401


def test_cannot_logout_someone_elses_token(auth_client, athlete, coach):
    _, coach_refresh = tokens_for(coach)
    response = auth_client(athlete).post(LOGOUT_URL, {"refresh": coach_refresh}, format="json")
    assert response.status_code == 400


def test_logout_with_garbage_token(auth_client, athlete):
    response = auth_client(athlete).post(LOGOUT_URL, {"refresh": "garbage"}, format="json")
    assert response.status_code == 400


@pytest.mark.usefixtures("redis_required")
def test_full_login_flow(api_client, django_capture_on_commit_callbacks):
    """سناریوی کامل: درخواست کد → تأیید → /me → refresh → logout."""
    from accounts.sms import locmem

    with django_capture_on_commit_callbacks(execute=True):
        api_client.post("/api/v1/auth/otp/request/", {"phone": "09121234567"}, format="json")
    code = locmem.outbox[-1]["code"]

    tokens = api_client.post(
        "/api/v1/auth/otp/verify/", {"phone": "09121234567", "code": code}, format="json"
    ).json()

    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")
    assert api_client.get(ME_URL).json()["phone"] == "09121234567"

    rotated = api_client.post(REFRESH_URL, {"refresh": tokens["refresh"]}, format="json").json()
    assert api_client.post(LOGOUT_URL, {"refresh": rotated["refresh"]}, format="json").status_code == 204
    assert api_client.post(REFRESH_URL, {"refresh": rotated["refresh"]}, format="json").status_code == 401
