import pytest
from django.db import connection

from core.testing import run_concurrently
from orders.models import OrderStatus, OrderStatusLog
from orders.services import mark_order_paid

pytestmark = pytest.mark.django_db


def pay(order):
    mark_order_paid(order)
    order.refresh_from_db()
    return order


def test_plan_coach_has_priority(make_order, make_plan, make_coach):
    plan_coach = make_coach()
    requested = make_coach()
    order = make_order(plan=make_plan(coach=plan_coach))
    order.requested_coach = requested  # ignored when the plan has its own coach
    assert pay(order).coach == plan_coach


def test_requested_coach_is_used(make_order, make_coach):
    make_coach()  # another free coach that would otherwise be picked
    requested = make_coach()
    order = make_order(requested_coach=requested)
    assert pay(order).coach == requested


def test_least_loaded_coach_is_picked(make_order, make_coach, make_plan):
    busy = make_coach(display_order=0)
    free = make_coach(display_order=1)
    pay(make_order(plan=make_plan(coach=busy)))  # busy now has 1 active order

    assert pay(make_order()).coach == free


def test_full_and_inactive_coaches_are_skipped(make_order, make_coach, make_plan):
    full = make_coach(capacity=1)
    pay(make_order(plan=make_plan(coach=full)))
    make_coach(is_active=False)
    make_coach(user_active=False)
    available = make_coach()

    assert pay(make_order()).coach == available


def test_no_coach_available_leaves_order_unassigned(make_order):
    order = pay(make_order())  # there are no coaches at all
    assert order.coach is None
    assert order.status == OrderStatus.QUESTIONNAIRE_PENDING
    assert "manual assignment" in OrderStatusLog.objects.filter(order=order).last().note


def test_finished_orders_free_capacity(make_order, make_coach, make_plan, advance_order, admin_user):
    from orders.services import transition

    coach = make_coach(capacity=1)
    plan = make_plan(coach=coach)
    first = advance_order(make_order(plan=plan), OrderStatus.DELIVERED)
    transition(first, OrderStatus.COMPLETED, actor=first.user)

    assert pay(make_order(plan=plan)).coach == coach


@pytest.mark.skipif(connection.vendor != "postgresql", reason="needs real row locks (PostgreSQL)")
@pytest.mark.django_db(transaction=True)
def test_concurrent_payments_cannot_exceed_capacity(make_order, make_coach):
    coach = make_coach(capacity=1)
    o1, o2 = make_order(), make_order()

    results = run_concurrently(lambda: mark_order_paid(o1), lambda: mark_order_paid(o2))
    assert all(kind == "ok" for kind, _ in results), results

    o1.refresh_from_db()
    o2.refresh_from_db()
    assigned = [o for o in (o1, o2) if o.coach_id == coach.pk]
    assert len(assigned) == 1
