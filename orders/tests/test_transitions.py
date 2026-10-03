import itertools

import pytest
from rest_framework.exceptions import PermissionDenied

from orders.models import Order, OrderStatus, OrderStatusLog
from orders.services import ALLOWED_TRANSITIONS, TIMESTAMP_FIELDS, InvalidTransition, transition

pytestmark = pytest.mark.django_db

S = OrderStatus
ALL_EDGES = list(itertools.product(S.values, S.values))


def force_status(order, status):
    """Test-only shortcut to put an order in any state (queryset.update skips save())."""
    Order.objects.filter(pk=order.pk).update(status=status)
    return Order.objects.get(pk=order.pk)


@pytest.fixture
def order(make_order, make_coach, make_plan):
    return make_order(plan=make_plan(coach=make_coach()))


# ---------- P3-05: every edge, positive and negative ----------

@pytest.mark.parametrize("from_status, to_status", ALL_EDGES)
def test_every_edge(order, admin_user, from_status, to_status):
    # Admin is allowed on every valid edge, so this isolates the state machine.
    order = force_status(order, from_status)
    logs_before = OrderStatusLog.objects.filter(order=order).count()

    if to_status in ALLOWED_TRANSITIONS[from_status]:
        transition(order, to_status, actor=admin_user, note="test")
        assert order.status == to_status
        assert OrderStatusLog.objects.filter(order=order).count() == logs_before + 1
        log = OrderStatusLog.objects.filter(order=order).last()
        assert (log.from_status, log.to_status, log.actor, log.note) == (from_status, to_status, admin_user, "test")
        if field := TIMESTAMP_FIELDS.get(to_status):
            assert getattr(order, field) is not None
    else:
        with pytest.raises(InvalidTransition):
            transition(order, to_status, actor=admin_user)
        order.refresh_from_db()
        assert order.status == from_status
        assert OrderStatusLog.objects.filter(order=order).count() == logs_before


def test_terminal_states_have_no_exits():
    for status in (S.COMPLETED, S.CANCELLED, S.EXPIRED):
        assert ALLOWED_TRANSITIONS[status] == frozenset()


def test_every_status_is_in_the_graph():
    assert set(ALLOWED_TRANSITIONS) == set(S.values)


# ---------- authorization (P3-15) ----------

def test_system_can_mark_paid_but_owner_cannot(order):
    with pytest.raises(PermissionDenied):
        transition(order, S.PAID, actor=order.user)
    transition(order, S.PAID, actor=None)
    assert order.status == S.PAID
    assert OrderStatusLog.objects.get(order=order).actor is None


def test_owner_can_cancel_pending_but_stranger_cannot(order, make_athlete):
    with pytest.raises(PermissionDenied):
        transition(order, S.CANCELLED, actor=make_athlete())
    transition(order, S.CANCELLED, actor=order.user)
    assert order.status == S.CANCELLED and order.cancelled_at


def test_only_assigned_coach_can_deliver(order, make_coach, advance_order):
    advance_order(order, S.IN_PROGRESS)
    other_coach = make_coach()
    with pytest.raises(PermissionDenied):
        transition(order, S.DELIVERED, actor=other_coach.user)
    with pytest.raises(PermissionDenied):
        transition(order, S.DELIVERED, actor=order.user)
    transition(order, S.DELIVERED, actor=order.coach.user)
    assert order.status == S.DELIVERED


def test_owner_cannot_cancel_after_payment(order, advance_order):
    advance_order(order, S.QUESTIONNAIRE_PENDING)
    with pytest.raises(PermissionDenied):
        transition(order, S.CANCELLED, actor=order.user)


def test_stale_instance_cannot_skip_states(order):
    stale = Order.objects.get(pk=order.pk)
    transition(order, S.CANCELLED, actor=order.user)
    # `stale` still says pending_payment in memory, but transition re-reads the row.
    with pytest.raises(InvalidTransition):
        transition(stale, S.PAID, actor=None)


# ---------- side effects ----------

def test_questionnaire_submission_sets_due_date(order, advance_order):
    advance_order(order, S.IN_PROGRESS)
    assert order.questionnaire_submitted_at is not None
    assert order.program_due_at > order.questionnaire_submitted_at


def test_delivery_sets_program_period(order, advance_order):
    advance_order(order, S.DELIVERED)
    assert order.starts_at == order.delivered_at
    assert (order.expires_at - order.starts_at).days == order.snapshot["duration_days"]


def test_renewal_starts_after_previous_order(make_order, make_plan, make_coach, advance_order):
    plan = make_plan(coach=make_coach())
    first = advance_order(make_order(plan=plan), S.DELIVERED)
    renewal = advance_order(make_order(user=first.user, plan=plan, renewed_from=first), S.DELIVERED)
    assert renewal.renewed_from == first
    assert renewal.starts_at == first.expires_at
    assert first.renewals.get() == renewal
