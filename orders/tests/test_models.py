import re

import pytest
from django.db import IntegrityError, transaction

from orders.models import ImmutableFieldError, Order, OrderStatus

pytestmark = pytest.mark.django_db


def test_order_number_unique_and_formatted(make_order):
    a, b = make_order(), make_order()
    assert re.fullmatch(r"ORD-\d{6}-[0-9A-F]{6}", a.number)
    assert a.number != b.number


def test_order_number_unique_in_db(make_order):
    a, b = make_order(), make_order()
    with pytest.raises(IntegrityError), transaction.atomic():
        Order.objects.filter(pk=b.pk).update(number=a.number)


def test_snapshot_is_immutable(make_order):
    order = make_order()
    order.snapshot = {**order.snapshot, "price": 1}
    with pytest.raises(ImmutableFieldError):
        order.save()


def test_snapshot_immutable_after_reload(make_order):
    order = Order.objects.get(pk=make_order().pk)
    order.snapshot["title"] = "changed"
    with pytest.raises(ImmutableFieldError):
        order.save()


def test_snapshot_keeps_price_when_plan_changes(make_order, make_plan):
    plan = make_plan(price=1_000_000)
    order = make_order(plan=plan)
    plan.price = 5_000_000
    plan.save()
    order.refresh_from_db()
    assert order.snapshot["price"] == 1_000_000 and order.total == 1_000_000


def test_status_cannot_be_set_directly(make_order):
    order = make_order()
    order.status = OrderStatus.PAID
    with pytest.raises(ImmutableFieldError):
        order.save()


def test_new_order_must_start_pending(make_order):
    template = make_order()
    clone = Order(
        user=template.user, plan=template.plan, snapshot=template.snapshot,
        subtotal=1, total=1, status=OrderStatus.PAID,
    )
    with pytest.raises(ImmutableFieldError):
        clone.save()


def test_total_must_match_subtotal_minus_discount(make_order):
    order = make_order()
    with pytest.raises(IntegrityError), transaction.atomic():
        Order.objects.filter(pk=order.pk).update(total=order.total + 1)


def test_one_pending_per_user_and_plan_in_db(make_order):
    order = make_order()
    clone = Order(user=order.user, plan=order.plan, snapshot=order.snapshot, subtotal=order.subtotal, total=order.total)
    with pytest.raises(IntegrityError), transaction.atomic():
        clone.save()


def test_revision_helpers(make_order, make_plan):
    order = make_order(plan=make_plan(revisions=3))
    assert order.revisions_allowed == 3
    assert order.can_request_revision is False  # not delivered yet
