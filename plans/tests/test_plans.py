import pytest
from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction

from plans.models import Plan

pytestmark = pytest.mark.django_db

LIST_URL = "/api/v1/plans/"


def slugs(response):
    return [p["slug"] for p in response.json()["results"]]


# ---------- P2-05: constraints ----------

@pytest.mark.parametrize(
    "field, value",
    [("price", 0), ("duration_days", 0), ("delivery_days", 0)],
)
def test_amount_and_duration_constraints(make_plan, field, value):
    with pytest.raises(IntegrityError), transaction.atomic():
        make_plan(**{field: value})


@pytest.mark.parametrize("compare_at", [1_000_000, 900_000])
def test_compare_at_price_must_exceed_price(make_plan, compare_at):
    with pytest.raises(IntegrityError), transaction.atomic():
        make_plan(price=1_000_000, compare_at_price=compare_at)


def test_compare_at_price_valid(make_plan):
    assert make_plan(price=1_000_000, compare_at_price=1_200_000).pk


def test_slug_unique(make_plan):
    make_plan(slug="basic")
    with pytest.raises(IntegrityError), transaction.atomic():
        make_plan(slug="basic")


def test_slug_auto_generated_with_suffix(make_plan):
    a = make_plan(title="برنامه تمرینی")
    b = make_plan(title="برنامه تمرینی")
    assert (a.slug, b.slug) == ("برنامه-تمرینی", "برنامه-تمرینی-2")


def test_features_must_be_list_of_strings(make_plan):
    plan = make_plan()
    plan.features = {"bad": True}
    with pytest.raises(ValidationError):
        plan.full_clean()


# ---------- P2-07: public API ----------

def test_only_active_plans(api_client, make_plan):
    active = make_plan()
    inactive = make_plan(is_active=False)
    result = slugs(api_client.get(LIST_URL))
    assert active.slug in result and inactive.slug not in result
    assert api_client.get(f"{LIST_URL}{inactive.slug}/").status_code == 404


def test_plan_of_inactive_coach_is_hidden(api_client, make_plan, make_coach):
    hidden = make_plan(coach=make_coach(is_active=False))
    assert hidden.slug not in slugs(api_client.get(LIST_URL))


def test_detail_by_persian_slug(api_client, make_plan):
    plan = make_plan(title="رژیم غذایی")
    body = api_client.get(f"{LIST_URL}{plan.slug}/").json()
    assert body["title"] == "رژیم غذایی"


def test_filter_by_type_and_coach(api_client, make_plan, make_coach):
    coach = make_coach()
    diet = make_plan(type=Plan.Type.DIET, coach=coach)
    make_plan(type=Plan.Type.WORKOUT)
    assert slugs(api_client.get(LIST_URL, {"type": "diet"})) == [diet.slug]
    assert slugs(api_client.get(LIST_URL, {"coach": coach.slug})) == [diet.slug]


def test_ordering_by_display_order(api_client, make_plan):
    b = make_plan(display_order=2)
    a = make_plan(display_order=1)
    assert slugs(api_client.get(LIST_URL)) == [a.slug, b.slug]


def test_nested_coach_summary(api_client, make_plan, make_coach):
    coach = make_coach(display_name="Coach X")
    plan = make_plan(coach=coach)
    body = api_client.get(f"{LIST_URL}{plan.slug}/").json()
    assert body["coach"]["display_name"] == "Coach X"
    assert "capacity" not in body["coach"]
