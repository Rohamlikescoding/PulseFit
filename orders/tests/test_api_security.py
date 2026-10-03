"""P3-13 / P3-15: an athlete only ever sees and changes their own orders."""

import pytest

from orders.models import OrderStatus, RevisionRequest
from orders.services import resolve_revision

pytestmark = pytest.mark.django_db

URL = "/api/v1/orders/"


@pytest.fixture
def two_orders(make_athlete, make_order, make_plan, make_coach):
    plan = make_plan(coach=make_coach(), revisions=1)
    a, b = make_athlete(), make_athlete()
    return make_order(user=a, plan=plan), make_order(user=b, plan=plan)


def test_list_shows_only_own_orders(auth_client, two_orders):
    order_a, order_b = two_orders
    numbers = [o["number"] for o in auth_client(order_a.user).get(URL).json()["results"]]
    assert numbers == [order_a.number]


def test_cannot_read_someone_elses_order(auth_client, two_orders):
    order_a, order_b = two_orders
    client = auth_client(order_a.user)
    assert client.get(f"{URL}{order_a.number}/").status_code == 200
    # 404 (not 403) so the number's existence isn't confirmed
    assert client.get(f"{URL}{order_b.number}/").status_code == 404


def test_cannot_cancel_someone_elses_order(auth_client, two_orders):
    order_a, order_b = two_orders
    assert auth_client(order_a.user).post(f"{URL}{order_b.number}/cancel/").status_code == 404
    order_b.refresh_from_db()
    assert order_b.status == OrderStatus.PENDING_PAYMENT


def test_owner_can_cancel_pending(auth_client, two_orders):
    order_a, _ = two_orders
    response = auth_client(order_a.user).post(f"{URL}{order_a.number}/cancel/")
    assert response.status_code == 200
    assert response.json()["status"] == "cancelled"


def test_owner_cannot_cancel_paid_order(auth_client, two_orders, advance_order):
    order_a, _ = two_orders
    advance_order(order_a, OrderStatus.QUESTIONNAIRE_PENDING)
    response = auth_client(order_a.user).post(f"{URL}{order_a.number}/cancel/")
    assert response.status_code == 403


def test_cancel_twice_is_conflict(auth_client, two_orders):
    order_a, _ = two_orders
    client = auth_client(order_a.user)
    client.post(f"{URL}{order_a.number}/cancel/")
    response = client.post(f"{URL}{order_a.number}/cancel/")
    assert response.status_code == 409
    assert response.json()["code"] == "invalid_transition"


def test_coach_cannot_use_athlete_order_api(auth_client, two_orders):
    order_a, _ = two_orders
    coach_user = order_a.plan.coach.user
    assert auth_client(coach_user).get(URL).status_code == 403


def test_detail_shows_history(auth_client, two_orders, advance_order):
    order_a, _ = two_orders
    advance_order(order_a, OrderStatus.IN_PROGRESS)
    body = auth_client(order_a.user).get(f"{URL}{order_a.number}/").json()
    assert [log["to_status"] for log in body["status_logs"]] == ["paid", "questionnaire_pending", "in_progress"]
    assert body["coach"]["slug"] == order_a.plan.coach.slug
    assert body["program_due_at"] is not None


# ---------- revisions (P3-03 / P3-14) ----------

def test_revision_flow(auth_client, two_orders, advance_order):
    order_a, _ = two_orders
    advance_order(order_a, OrderStatus.DELIVERED)
    client = auth_client(order_a.user)

    response = client.post(f"{URL}{order_a.number}/revisions/", {"note": "Less cardio"}, format="json")
    assert response.status_code == 201
    order_a.refresh_from_db()
    assert order_a.status == OrderStatus.IN_PROGRESS
    assert order_a.revisions_used == 1
    revision = RevisionRequest.objects.get()
    assert revision.coach == order_a.coach  # traceable to the coach

    # coach finishes it -> delivered again
    resolve_revision(revision, actor=order_a.coach.user, accepted=True, coach_note="Done")
    order_a.refresh_from_db()
    assert order_a.status == OrderStatus.DELIVERED

    # plan allowed only 1 revision
    response = client.post(f"{URL}{order_a.number}/revisions/", {"note": "Again"}, format="json")
    assert response.status_code == 400


def test_rejected_revision_does_not_use_quota(auth_client, two_orders, advance_order):
    order_a, _ = two_orders
    advance_order(order_a, OrderStatus.DELIVERED)
    auth_client(order_a.user).post(f"{URL}{order_a.number}/revisions/", {"note": "x"}, format="json")

    resolve_revision(RevisionRequest.objects.get(), actor=order_a.coach.user, accepted=False)
    order_a.refresh_from_db()
    assert (order_a.status, order_a.revisions_used) == (OrderStatus.DELIVERED, 0)


def test_other_coach_cannot_resolve_revision(auth_client, two_orders, advance_order, make_coach):
    from rest_framework.exceptions import PermissionDenied

    order_a, _ = two_orders
    advance_order(order_a, OrderStatus.DELIVERED)
    auth_client(order_a.user).post(f"{URL}{order_a.number}/revisions/", {"note": "x"}, format="json")
    with pytest.raises(PermissionDenied):
        resolve_revision(RevisionRequest.objects.get(), actor=make_coach().user, accepted=True)


def test_cannot_request_revision_on_someone_elses_order(auth_client, two_orders, advance_order):
    order_a, order_b = two_orders
    advance_order(order_b, OrderStatus.DELIVERED)
    response = auth_client(order_a.user).post(f"{URL}{order_b.number}/revisions/", {"note": "x"}, format="json")
    assert response.status_code == 404
