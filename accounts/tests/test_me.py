from datetime import date

import pytest

from accounts.models import AthleteProfile

pytestmark = pytest.mark.django_db

ME_URL = "/api/v1/me/"


def test_me_requires_authentication(api_client):
    assert api_client.get(ME_URL).status_code == 401


def test_get_me_without_profile(auth_client, athlete):
    body = auth_client(athlete).get(ME_URL).json()
    assert body["phone"] == athlete.phone
    assert body["role"] == "ATHLETE"
    assert body["athlete_profile"] is None


def test_patch_creates_profile(auth_client, athlete):
    response = auth_client(athlete).patch(
        ME_URL,
        {"athlete_profile": {"gender": "MALE", "height_cm": 180, "days_per_week": 4, "goal": "STRENGTH"}},
        format="json",
    )
    assert response.status_code == 200, response.json()
    profile = AthleteProfile.objects.get(user=athlete)
    assert (profile.height_cm, profile.days_per_week, profile.goal) == (180, 4, "STRENGTH")


def test_patch_updates_only_given_fields(auth_client, athlete):
    AthleteProfile.objects.create(user=athlete, height_cm=170, days_per_week=3)
    auth_client(athlete).patch(ME_URL, {"athlete_profile": {"days_per_week": 5}}, format="json")
    profile = AthleteProfile.objects.get(user=athlete)
    assert (profile.height_cm, profile.days_per_week) == (170, 5)


@pytest.mark.parametrize(
    "field, value",
    [
        ("days_per_week", 1),
        ("days_per_week", 8),
        ("height_cm", 50),
        ("weight_kg", "500"),
        ("gender", "OTHER"),
        ("birth_date", str(date.today())),
    ],
)
def test_profile_validation(auth_client, athlete, field, value):
    response = auth_client(athlete).patch(ME_URL, {"athlete_profile": {field: value}}, format="json")
    assert response.status_code == 400
    assert field in response.json()["errors"]["athlete_profile"]


def test_cannot_change_role_or_phone(auth_client, athlete):
    response = auth_client(athlete).patch(
        ME_URL, {"role": "ADMIN", "phone": "09359999999"}, format="json"
    )
    assert response.status_code == 200
    athlete.refresh_from_db()
    assert athlete.role == "ATHLETE"
    assert athlete.phone == "09120000001"


def test_user_only_sees_own_data(auth_client, athlete, coach):
    AthleteProfile.objects.create(user=athlete, injuries="knee")
    body = auth_client(coach).get(ME_URL).json()
    assert body["phone"] == coach.phone
    assert body["athlete_profile"] is None


def test_coach_cannot_create_athlete_profile(auth_client, coach):
    response = auth_client(coach).patch(ME_URL, {"athlete_profile": {"days_per_week": 3}}, format="json")
    assert response.status_code == 400
    assert not AthleteProfile.objects.filter(user=coach).exists()


def test_put_and_delete_not_allowed(auth_client, athlete):
    client = auth_client(athlete)
    assert client.put(ME_URL, {}, format="json").status_code == 405
    assert client.delete(ME_URL).status_code == 405


def test_db_constraint_enforces_days_per_week(athlete):
    from django.db import IntegrityError, transaction

    with pytest.raises(IntegrityError), transaction.atomic():
        AthleteProfile.objects.create(user=athlete, days_per_week=9)
