import pytest

from discounts.models import DiscountUsage
from orders.models import Order, OrderStatus, OrderStatusLog

pytestmark = pytest.mark.django_db

URL = "/api/v1/orders/"


@pytest.fixture
def athlete_client(auth_client, make_athlete):
    user = make_athlete()
    client = auth_client(user)
    client.user = user
    return client


# ---------- P3-08 ----------

def test_create_order_snapshots_price(athlete_client, make_plan):
    plan = make_plan(price=1_500_000, title="Strength 8w")
    response = athlete_client.post(URL, {"plan_id": plan.pk}, format="json")

    assert response.status_code == 201, response.json()
    body = response.json()
    assert body["status"] == "pending_payment"
    assert (body["subtotal"], body["discount_amount"], body["total"]) == (1_500_000, 0, 1_500_000)
    assert body["snapshot"]["title"] == "Strength 8w"
    assert body["snapshot"]["price"] == 1_500_000


def test_client_cannot_set_price_or_status(athlete_client, make_plan):
    plan = make_plan(price=1_000_000)
    response = athlete_client.post(
        URL, {"plan_id": plan.pk, "total": 1, "subtotal": 1, "status": "paid"}, format="json"
    )
    body = response.json()
    assert (body["total"], body["status"]) == (1_000_000, "pending_payment")


def test_inactive_plan_rejected(athlete_client, make_plan):
    response = athlete_client.post(URL, {"plan_id": make_plan(is_active=False).pk}, format="json")
    assert response.status_code == 400
    assert not Order.objects.exists()


def test_with_discount_code(athlete_client, make_plan, make_discount):
    plan = make_plan(price=1_000_000)
    d = make_discount(code="OFF20", value=20)
    body = athlete_client.post(URL, {"plan_id": plan.pk, "discount_code": "off20"}, format="json").json()
    assert (body["discount_amount"], body["total"]) == (200_000, 800_000)
    # Not consumed yet: that happens on payment.
    d.refresh_from_db()
    assert d.used_count == 0


def test_invalid_discount_creates_nothing(athlete_client, make_plan):
    response = athlete_client.post(URL, {"plan_id": make_plan().pk, "discount_code": "NOPE"}, format="json")
    assert response.status_code == 400
    assert response.json()["code"] == "discount_not_found"
    assert not Order.objects.exists()


def test_requested_coach_validation(athlete_client, make_plan, make_coach, make_order):
    plan = make_plan()
    full = make_coach(capacity=1)
    from orders.services import mark_order_paid

    mark_order_paid(make_order(plan=make_plan(coach=full)))
    response = athlete_client.post(URL, {"plan_id": plan.pk, "coach_id": full.pk}, format="json")
    assert response.status_code == 400 and "coach_id" in response.json()["errors"]

    hidden = make_coach(is_active=False)
    response = athlete_client.post(URL, {"plan_id": plan.pk, "coach_id": hidden.pk}, format="json")
    assert response.status_code == 400


def test_coach_of_another_plan_rejected(athlete_client, make_plan, make_coach):
    plan = make_plan(coach=make_coach())
    response = athlete_client.post(URL, {"plan_id": plan.pk, "coach_id": make_coach().pk}, format="json")
    assert response.status_code == 400


def test_only_athletes_can_order(auth_client, make_coach, make_plan):
    coach = make_coach()
    response = auth_client(coach.user).post(URL, {"plan_id": make_plan().pk}, format="json")
    assert response.status_code == 403


def test_login_required(api_client, make_plan):
    assert api_client.post(URL, {"plan_id": make_plan().pk}, format="json").status_code == 401


# ---------- P3-09: duplicate pending is cancelled ----------

def test_new_order_cancels_previous_pending(athlete_client, make_plan):
    plan = make_plan()
    first = athlete_client.post(URL, {"plan_id": plan.pk}, format="json").json()["number"]
    second = athlete_client.post(URL, {"plan_id": plan.pk}, format="json").json()["number"]

    old = Order.objects.get(number=first)
    assert old.status == OrderStatus.CANCELLED and old.cancelled_at is not None
    log = OrderStatusLog.objects.get(order=old)
    assert (log.from_status, log.to_status, log.actor) == ("pending_payment", "cancelled", None)
    assert "Replaced" in log.note

    assert Order.objects.get(number=second).status == OrderStatus.PENDING_PAYMENT
    assert Order.objects.filter(user=athlete_client.user, plan=plan, status="pending_payment").count() == 1


def test_pending_orders_for_different_plans_coexist(athlete_client, make_plan):
    athlete_client.post(URL, {"plan_id": make_plan().pk}, format="json")
    athlete_client.post(URL, {"plan_id": make_plan().pk}, format="json")
    assert Order.objects.filter(status="pending_payment").count() == 2


# ---------- P3-12: zero total ----------

def test_full_discount_pays_without_gateway(athlete_client, make_plan, make_discount, make_coach):
    coach = make_coach()
    plan = make_plan(price=1_000_000, coach=coach)
    d = make_discount(code="FREE", value=100)

    body = athlete_client.post(URL, {"plan_id": plan.pk, "discount_code": "FREE"}, format="json").json()
    order = Order.objects.get(number=body["number"])

    assert order.total == 0
    assert order.status == OrderStatus.QUESTIONNAIRE_PENDING
    assert order.paid_at is not None and order.coach == coach
    steps = list(OrderStatusLog.objects.filter(order=order).values_list("to_status", flat=True))
    assert steps == ["paid", "questionnaire_pending"]
    assert "Zero total" in OrderStatusLog.objects.filter(order=order).first().note
    # discount consumed exactly once
    d.refresh_from_db()
    assert d.used_count == 1
    assert DiscountUsage.objects.get().order == order


# ---------- P3-14: renewal ----------

def test_renewal_of_own_delivered_order(athlete_client, make_plan, make_coach, make_order, advance_order):
    plan = make_plan(coach=make_coach())
    first = advance_order(make_order(user=athlete_client.user, plan=plan), OrderStatus.DELIVERED)
    body = athlete_client.post(URL, {"plan_id": plan.pk, "renewed_from": first.number}, format="json").json()
    assert body["renewed_from"] == first.number


def test_cannot_renew_someone_elses_order(athlete_client, make_plan, make_coach, make_order, advance_order):
    plan = make_plan(coach=make_coach())
    other = advance_order(make_order(plan=plan), OrderStatus.DELIVERED)
    response = athlete_client.post(URL, {"plan_id": plan.pk, "renewed_from": other.number}, format="json")
    assert response.status_code == 400
    assert "renewed_from" in response.json()["errors"]


def test_cannot_renew_unpaid_order(athlete_client, make_plan):
    plan = make_plan()
    pending = athlete_client.post(URL, {"plan_id": plan.pk}, format="json").json()["number"]
    response = athlete_client.post(URL, {"plan_id": make_plan().pk, "renewed_from": pending}, format="json")
    assert response.status_code == 400
