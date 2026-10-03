import pytest
from rest_framework.test import APIClient

from accounts.sms import locmem
from core.redis_client import redis_client


@pytest.fixture(autouse=True)
def _test_settings(settings):
    # پیامک‌ها به‌جای کنسول در locmem.outbox جمع می‌شوند تا تست کد را بخواند.
    settings.SMS_BACKEND = "accounts.sms.locmem.LocMemSMSBackend"
    # task های Celery همان‌جا اجرا شوند (worker لازم نیست).
    # Celery با namespace="CELERY" این مقادیر را زنده از settings جنگو می‌خواند،
    # پس باید همین‌جا عوضشان کرد؛ set کردن روی celery_app.conf اثری ندارد.
    settings.CELERY_TASK_ALWAYS_EAGER = True
    settings.CELERY_TASK_EAGER_PROPAGATES = True
    locmem.outbox.clear()
    yield
    locmem.outbox.clear()


@pytest.fixture(autouse=True)
def _clear_otp_rate_limits():
    # شمارنده‌های rate-limit در Redis واقعی هستند؛ بین تست‌ها پاکشان می‌کنیم.
    def clear():
        try:
            keys = list(redis_client.scan_iter("otp:rl:*"))
            if keys:
                redis_client.delete(*keys)
        except Exception:
            pass

    clear()
    yield
    clear()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def make_user(db, django_user_model):
    def make(phone="09120000001", **extra):
        return django_user_model.objects.create_user(phone=phone, **extra)

    return make


@pytest.fixture
def athlete(make_user):
    return make_user("09120000001")


@pytest.fixture
def coach(make_user, django_user_model):
    return make_user("09120000002", role=django_user_model.Role.COACH)


@pytest.fixture
def admin_user(db, django_user_model):
    return django_user_model.objects.create_superuser(phone="09120000003", password="Str0ng-pass!")


@pytest.fixture
def auth_client():
    def make(user):
        client = APIClient()
        client.force_authenticate(user=user)
        return client

    return make


@pytest.fixture
def redis_required():
    """تست‌هایی که به Redis واقعی نیاز دارند (rate-limit) اگر Redis خاموش باشد skip می‌شوند."""
    try:
        redis_client.ping()
    except Exception:
        pytest.skip("Redis is not running (scripts/start_services.ps1)")


# --- phase 2/3 factories -------------------------------------------------------

import itertools  # noqa: E402

_seq = itertools.count(1)


@pytest.fixture(autouse=True)
def _media_in_tmp(settings, tmp_path):
    settings.MEDIA_ROOT = tmp_path / "media"


@pytest.fixture
def make_athlete(db, django_user_model):
    def make(**extra):
        return django_user_model.objects.create_user(phone=f"0912{next(_seq):07d}", **extra)

    return make


@pytest.fixture
def make_coach(db, django_user_model):
    from coaches.models import CoachProfile

    def make(*, is_active=True, capacity=10, user_active=True, **extra):
        n = next(_seq)
        user = django_user_model.objects.create_user(
            phone=f"0913{n:07d}", role=django_user_model.Role.COACH, is_active=user_active
        )
        extra.setdefault("display_name", f"Coach {n}")
        return CoachProfile.objects.create(user=user, is_active=is_active, capacity=capacity, **extra)

    return make


@pytest.fixture
def make_plan(db):
    from plans.models import Plan

    def make(**extra):
        n = next(_seq)
        defaults = {
            "type": Plan.Type.WORKOUT,
            "title": f"Plan {n}",
            "duration_days": 30,
            "delivery_days": 3,
            "price": 1_000_000,
            "revisions": 2,
            "features": ["Weekly check-in"],
            "is_active": True,
        }
        defaults.update(extra)
        return Plan.objects.create(**defaults)

    return make


@pytest.fixture
def make_discount(db):
    from discounts.models import DiscountCode

    def make(**extra):
        defaults = {"code": f"CODE{next(_seq)}", "type": DiscountCode.Type.PERCENT, "value": 10}
        defaults.update(extra)
        plans = defaults.pop("plans", None)
        discount = DiscountCode.objects.create(**defaults)
        if plans:
            discount.plans.set(plans)
        return discount

    return make


@pytest.fixture
def make_order(make_athlete, make_plan):
    """Create an order through the real service (never Order.objects.create)."""
    from orders.services import create_order

    def make(user=None, plan=None, **extra):
        return create_order(user=user or make_athlete(), plan=plan or make_plan(), **extra)

    return make


@pytest.fixture
def advance_order():
    """
    Walk an order through the real transitions:
    pending -> paid -> questionnaire_pending -> in_progress -> delivered.
    """
    from orders.models import OrderStatus as S
    from orders.services import mark_order_paid, transition

    def advance(order, until):
        steps = [S.QUESTIONNAIRE_PENDING, S.IN_PROGRESS, S.DELIVERED]
        if order.status == S.PENDING_PAYMENT:
            mark_order_paid(order)
        for target in steps:
            if order.status == until:
                break
            if target == S.IN_PROGRESS:
                transition(order, S.IN_PROGRESS, actor=order.user)
            elif target == S.DELIVERED:
                transition(order, S.DELIVERED, actor=order.coach.user)
        assert order.status == until, f"stopped at {order.status}"
        return order

    return advance
