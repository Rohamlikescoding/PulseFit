import pytest
from django.urls import path
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAthlete, IsCoach

pytestmark = [pytest.mark.django_db, pytest.mark.urls(__name__)]


class AthleteOnlyView(APIView):
    permission_classes = [IsAthlete]

    def get(self, request):
        return Response({"ok": True})


class CoachOnlyView(APIView):
    permission_classes = [IsCoach]

    def get(self, request):
        return Response({"ok": True})


urlpatterns = [
    path("athlete-only/", AthleteOnlyView.as_view()),
    path("coach-only/", CoachOnlyView.as_view()),
]


def test_athlete_allowed(auth_client, athlete):
    assert auth_client(athlete).get("/athlete-only/").status_code == 200


def test_coach_denied_on_athlete_endpoint(auth_client, coach):
    response = auth_client(coach).get("/athlete-only/")
    assert response.status_code == 403
    assert response.json()["code"] == "permission_denied"


def test_admin_denied_on_athlete_endpoint(auth_client, admin_user):
    # حتی superuser هم به endpoint صرفاً شاگردی دسترسی ندارد.
    assert auth_client(admin_user).get("/athlete-only/").status_code == 403


def test_anonymous_gets_401(api_client):
    assert api_client.get("/athlete-only/").status_code == 401


def test_coach_permission(auth_client, athlete, coach):
    assert auth_client(coach).get("/coach-only/").status_code == 200
    assert auth_client(athlete).get("/coach-only/").status_code == 403
