from datetime import timedelta

import pytest
from django.db import IntegrityError, connection, transaction
from django.utils import timezone

from core.testing import run_concurrently
from discounts.models import DiscountCode, DiscountUsage
from discounts.services import InvalidDiscount, calculate_discount, find_discount

pytestmark = pytest.mark.django_db

VALIDATE_URL = "/api/v1/discounts/validate/"


# ---------- P2-06: case-insensitive, exact time window ----------

def test_code_is_stored_upper_and_found_case_insensitively(make_discount):
    make_discount(code="  summer25 ")
    assert DiscountCode.objects.get().code == "SUMMER25"
    assert find_discount("Summer25").code == "SUMMER25"


def test_codes_unique_ignoring_case(make_discount):
    make_discount(code="SUMMER")
    with pytest.raises(IntegrityError), transaction.atomic():
        # bypass save() normalization to prove the DB constraint itself works
        DiscountCode.objects.bulk_create([DiscountCode(code="summer", type="percent", value=5)])


def test_time_window_boundaries(make_discount):
    start = timezone.now()
    end = start + timedelta(days=1)
    d = make_discount(valid_from=start, valid_until=end)
    assert not d.is_valid_at(start - timedelta(microseconds=1))
    assert d.is_valid_at(start)                                  # inclusive start
    assert d.is_valid_at(end - timedelta(microseconds=1))
    assert not d.is_valid_at(end)                                # exclusive end


def test_percent_value_range_constraint(make_discount):
    with pytest.raises(IntegrityError), transaction.atomic():
        make_discount(type="percent", value=150)


# ---------- calculation rules (shared by P3-10 and create_order) ----------

def test_percent_with_cap(make_discount, make_plan, make_athlete):
    d = make_discount(value=50, max_discount_amount=200_000)
    r = calculate_discount(d, make_plan(price=1_000_000), make_athlete())
    assert (r.subtotal, r.discount_amount, r.total) == (1_000_000, 200_000, 800_000)


def test_percent_rounding(make_discount, make_plan, make_athlete):
    r = calculate_discount(make_discount(value=15), make_plan(price=999_999), make_athlete())
    assert r.discount_amount == 150_000  # 149999.85 -> 150000


def test_fixed_never_goes_below_zero(make_discount, make_plan, make_athlete):
    r = calculate_discount(make_discount(type="fixed", value=5_000_000), make_plan(price=1_000_000), make_athlete())
    assert (r.discount_amount, r.total) == (1_000_000, 0)


@pytest.mark.parametrize(
    "kwargs, code",
    [
        ({"is_active": False}, "discount_inactive"),
        ({"valid_from": timezone.now() + timedelta(hours=1)}, "discount_not_started"),
        (
            {"valid_from": timezone.now() - timedelta(days=2), "valid_until": timezone.now() - timedelta(days=1)},
            "discount_expired",
        ),
        ({"min_order_amount": 5_000_000}, "discount_min_amount"),
        ({"usage_limit": 3, "used_count": 3}, "discount_quota_exhausted"),
    ],
)
def test_invalid_reasons(make_discount, make_plan, make_athlete, kwargs, code):
    with pytest.raises(InvalidDiscount) as exc:
        calculate_discount(make_discount(**kwargs), make_plan(), make_athlete())
    assert exc.value.default_code == code


def test_plan_scope(make_discount, make_plan, make_athlete):
    allowed, other = make_plan(), make_plan()
    d = make_discount(plans=[allowed])
    assert calculate_discount(d, allowed, make_athlete()).discount_amount > 0
    with pytest.raises(InvalidDiscount):
        calculate_discount(d, other, make_athlete())


def test_per_user_limit(make_discount, make_plan, make_order, make_athlete):
    plan = make_plan()
    user = make_athlete()
    d = make_discount(type="fixed", value=plan.price, per_user_limit=1)  # 100% -> paid at creation
    make_order(user=user, plan=plan, discount_code=d.code)
    with pytest.raises(InvalidDiscount) as exc:
        calculate_discount(d, plan, user)
    assert exc.value.default_code == "discount_user_limit"
    # another user can still use it
    assert calculate_discount(d, plan, make_athlete()).total == 0


# ---------- P3-10: validate API is read-only ----------

def test_validate_returns_price_without_consuming(auth_client, make_athlete, make_discount, make_plan):
    d = make_discount(code="OFF10", value=10, usage_limit=5)
    plan = make_plan(price=2_000_000)
    response = auth_client(make_athlete()).post(VALIDATE_URL, {"plan_id": plan.pk, "code": "off10"}, format="json")

    assert response.status_code == 200
    assert response.json() == {"code": "OFF10", "subtotal": 2_000_000, "discount_amount": 200_000, "total": 1_800_000}
    d.refresh_from_db()
    assert d.used_count == 0
    assert not DiscountUsage.objects.exists()


def test_validate_unknown_code(auth_client, make_athlete, make_plan):
    response = auth_client(make_athlete()).post(VALIDATE_URL, {"plan_id": make_plan().pk, "code": "NOPE"}, format="json")
    assert response.status_code == 400
    assert response.json()["code"] == "discount_not_found"


def test_validate_requires_login(api_client, make_plan):
    assert api_client.post(VALIDATE_URL, {"plan_id": make_plan().pk, "code": "X"}, format="json").status_code == 401


def test_validate_rejects_inactive_plan(auth_client, make_athlete, make_plan, make_discount):
    d = make_discount()
    response = auth_client(make_athlete()).post(
        VALIDATE_URL, {"plan_id": make_plan(is_active=False).pk, "code": d.code}, format="json"
    )
    assert response.status_code == 400
    assert "plan_id" in response.json()["errors"]


# ---------- P3-11: concurrent payments cannot over-use the quota ----------

@pytest.mark.skipif(connection.vendor != "postgresql", reason="needs real row locks (PostgreSQL)")
@pytest.mark.django_db(transaction=True)
def test_concurrent_payments_respect_quota(make_discount, make_plan, make_order):
    from orders.services import mark_order_paid

    plan = make_plan(price=1_000_000)
    d = make_discount(value=10, usage_limit=1, per_user_limit=None)
    o1 = make_order(plan=plan, discount_code=d.code)
    o2 = make_order(plan=plan, discount_code=d.code)

    results = run_concurrently(lambda: mark_order_paid(o1), lambda: mark_order_paid(o2))

    outcomes = sorted(kind for kind, _ in results)
    assert outcomes == ["error", "ok"], results
    error = next(value for kind, value in results if kind == "error")
    assert isinstance(error, InvalidDiscount)

    d.refresh_from_db()
    assert d.used_count == 1
    assert DiscountUsage.objects.count() == 1
