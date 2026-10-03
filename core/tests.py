import uuid
from decimal import Decimal

import pytest
import redis
from django.urls import path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import NotFound
from rest_framework.permissions import AllowAny
from rest_framework.test import APIClient

from core import views
from core.redis_client import redis_client
from core.utils import (
    get_cache_value,
    increment_counter,
    money_round,
    normalize_phone,
    set_cache_value,
)


def _redis_available() -> bool:
    try:
        return redis_client.ping()
    except redis.RedisError:
        return False


requires_redis = pytest.mark.skipif(
    not _redis_available(), reason="Redis is not running"
)


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def redis_key():
    key = f"test:{uuid.uuid4().hex}"
    yield key
    redis_client.delete(key)


# ---------- utils ----------

@pytest.mark.parametrize(
    "raw",
    [
        "09121234567",
        "9121234567",
        "+989121234567",
        "00989121234567",
        "989121234567",
        "0912 123 4567",
        "۰۹۱۲۱۲۳۴۵۶۷",
    ],
)
def test_normalize_phone_valid(raw):
    assert normalize_phone(raw) == "09121234567"


@pytest.mark.parametrize("raw", ["", None, "12345", "0812345678", "091212345678"])
def test_normalize_phone_invalid(raw):
    with pytest.raises(ValueError):
        normalize_phone(raw)


@pytest.mark.parametrize(
    "value, expected",
    [(2.5, 3), (2.4, 2), ("1000.5", 1001), (Decimal("1.49"), 1), (7, 7)],
)
def test_money_round(value, expected):
    assert money_round(value) == Decimal(expected)


@requires_redis
def test_cache_set_get(redis_key):
    set_cache_value(redis_key, "hello", ttl=10)
    assert get_cache_value(redis_key) == "hello"
    assert 0 < redis_client.ttl(redis_key) <= 10


@requires_redis
def test_increment_counter_sets_ttl_once(redis_key):
    assert increment_counter(redis_key, ttl=30) == 1
    assert increment_counter(redis_key, ttl=30) == 2
    assert increment_counter(redis_key, ttl=30) == 3
    assert 0 < redis_client.ttl(redis_key) <= 30


@requires_redis
def test_django_cache_uses_redis():
    from django.core.cache import cache

    key = f"test:{uuid.uuid4().hex}"
    cache.set(key, {"a": 1}, timeout=10)
    try:
        assert cache.get(key) == {"a": 1}
    finally:
        cache.delete(key)


# ---------- views ----------

@pytest.mark.django_db
@requires_redis
def test_health_check_ok(api_client):
    response = api_client.get("/api/v1/health/")
    assert response.status_code == 200
    assert response.json()["services"] == {"database": "ok", "redis": "ok"}


@pytest.mark.django_db
def test_health_check_redis_down(api_client, monkeypatch):
    def fail():
        raise redis.ConnectionError("down")

    monkeypatch.setattr(views.redis_client, "ping", fail)
    response = api_client.get("/api/v1/health/")
    assert response.status_code == 503
    assert response.json()["services"]["redis"] == "down"


def test_demo_validation_ok(api_client):
    response = api_client.post("/api/v1/demo-validation/", {"name": "Ali"}, format="json")
    assert response.status_code == 200
    assert response.json() == {"name": "Ali"}


def test_demo_validation_error_format(api_client):
    response = api_client.post("/api/v1/demo-validation/", {}, format="json")
    body = response.json()
    assert response.status_code == 400
    assert body["code"] == "invalid"
    assert body["detail"] == "Validation failed."
    assert "name" in body["errors"]


# ---------- exception handler ----------

@api_view(["GET"])
@permission_classes([AllowAny])
def _raise_not_found(request):
    raise NotFound("Plan not found.")


@api_view(["GET"])
@permission_classes([AllowAny])
def _raise_django_404(request):
    from django.http import Http404
    raise Http404


@api_view(["GET"])
@permission_classes([AllowAny])
def _raise_crash(request):
    raise RuntimeError("secret internal detail")


urlpatterns = [
    path("not-found/", _raise_not_found),
    path("django-404/", _raise_django_404),
    path("crash/", _raise_crash),
]


@pytest.mark.urls("core.tests")
def test_not_found_keeps_message(api_client):
    body = api_client.get("/not-found/").json()
    assert body == {"detail": "Plan not found.", "code": "not_found", "errors": None}


@pytest.mark.urls("core.tests")
def test_django_404_gets_not_found_code(api_client):
    response = api_client.get("/django-404/")
    assert response.status_code == 404
    assert response.json()["code"] == "not_found"


@pytest.mark.urls("core.tests")
def test_unhandled_error_hides_details(api_client):
    response = api_client.get("/crash/")
    assert response.status_code == 500
    assert response.json()["code"] == "internal_error"
    assert "secret" not in response.content.decode()
