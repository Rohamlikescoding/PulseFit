import pytest

from coaches.models import CoachCertificate, CoachReview, Specialty

pytestmark = pytest.mark.django_db

LIST_URL = "/api/v1/coaches/"


def detail_url(coach):
    return f"/api/v1/coaches/{coach.slug}/"


def slugs(response):
    return [c["slug"] for c in response.json()["results"]]


# ---------- visibility (P2-08 / P2-10) ----------

def test_only_active_coaches_are_listed(api_client, make_coach):
    visible = make_coach()
    hidden = make_coach(is_active=False)
    disabled_user = make_coach(user_active=False)

    result = slugs(api_client.get(LIST_URL))
    assert visible.slug in result
    assert hidden.slug not in result
    assert disabled_user.slug not in result


def test_inactive_coach_detail_is_404(api_client, make_coach):
    assert api_client.get(detail_url(make_coach(is_active=False))).status_code == 404


def test_persian_slug_detail(api_client, make_coach):
    coach = make_coach(display_name="سارا محمدی")
    assert api_client.get(detail_url(coach)).status_code == 200


def test_unapproved_certificates_do_not_leak(api_client, make_coach):
    coach = make_coach()
    CoachCertificate.objects.create(coach=coach, title="Approved cert", issuer="X", year=2020, is_approved=True)
    CoachCertificate.objects.create(coach=coach, title="Secret cert", issuer="X", year=2021, is_approved=False)

    body = api_client.get(detail_url(coach)).json()
    titles = [c["title"] for c in body["certificates"]]
    assert titles == ["Approved cert"]


def test_unapproved_reviews_do_not_leak(api_client, make_coach, make_plan, make_order, advance_order):
    coach = make_coach()
    plan = make_plan(coach=coach)
    o1 = advance_order(make_order(plan=plan), "delivered")
    o2 = advance_order(make_order(plan=plan), "delivered")
    CoachReview.objects.create(order=o1, coach=coach, user=o1.user, rating=5, comment="great", is_approved=True)
    CoachReview.objects.create(order=o2, coach=coach, user=o2.user, rating=1, comment="hidden", is_approved=False)

    body = api_client.get(detail_url(coach)).json()
    assert [r["comment"] for r in body["reviews"]] == ["great"]
    assert body["rating_count"] == 1


def test_private_fields_are_not_exposed(api_client, make_coach):
    coach = make_coach()
    for body in (api_client.get(LIST_URL).json()["results"][0], api_client.get(detail_url(coach)).json()):
        for field in ("capacity", "commission_percent", "user", "phone", "is_active"):
            assert field not in body


def test_inactive_specialty_hidden_in_nested_data(api_client, make_coach):
    active = Specialty.objects.create(name="Strength", slug="strength")
    inactive = Specialty.objects.create(name="Old", slug="old", is_active=False)
    coach = make_coach()
    coach.specialties.set([active, inactive])

    body = api_client.get(detail_url(coach)).json()
    assert [s["slug"] for s in body["specialties"]] == ["strength"]


# ---------- filters & ordering ----------

def test_filter_by_specialty_is_distinct(api_client, make_coach):
    s1 = Specialty.objects.create(name="Strength", slug="strength")
    s2 = Specialty.objects.create(name="Yoga", slug="yoga")
    coach = make_coach()
    coach.specialties.set([s1, s2])
    other = make_coach()

    result = slugs(api_client.get(LIST_URL, {"specialty": "strength"}))
    assert result == [coach.slug]
    assert other.slug not in result


def test_filter_by_gender(api_client, make_coach):
    female = make_coach(gender="FEMALE")
    make_coach(gender="MALE")
    assert slugs(api_client.get(LIST_URL, {"gender": "FEMALE"})) == [female.slug]


def test_ordering_by_display_order(api_client, make_coach):
    second = make_coach(display_order=2)
    first = make_coach(display_order=1)
    assert slugs(api_client.get(LIST_URL)) == [first.slug, second.slug]


def test_list_has_no_n_plus_one(api_client, make_coach, django_assert_max_num_queries):
    s = Specialty.objects.create(name="Strength", slug="strength")
    for _ in range(5):
        make_coach().specialties.add(s)
    with django_assert_max_num_queries(3):  # count + coaches + specialties prefetch
        api_client.get(LIST_URL)


def test_specialties_endpoint_lists_only_active(api_client):
    Specialty.objects.create(name="Strength", slug="strength")
    Specialty.objects.create(name="Old", slug="old", is_active=False)
    body = api_client.get("/api/v1/specialties/").json()
    assert [s["slug"] for s in body] == ["strength"]
