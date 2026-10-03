"""
Order business logic. This is the ONLY module allowed to change Order.status
(Order.save() refuses status changes that don't come through transition()).
"""

from datetime import timedelta

from django.db import IntegrityError, transaction
from django.db.models import Count, F, Q
from django.utils import timezone
from rest_framework import status as http_status
from rest_framework.exceptions import APIException, PermissionDenied, ValidationError

from coaches.models import CoachProfile
from discounts.services import consume_discount, price_for

from .models import ACTIVE_STATUSES, Order, OrderStatus, OrderStatusLog, RevisionRequest
from .utils import add_business_days

S = OrderStatus

# --- state machine -------------------------------------------------------------

ALLOWED_TRANSITIONS: dict[str, frozenset[str]] = {
    S.PENDING_PAYMENT: frozenset({S.PAID, S.CANCELLED, S.EXPIRED}),
    S.PAID: frozenset({S.QUESTIONNAIRE_PENDING, S.CANCELLED}),
    S.QUESTIONNAIRE_PENDING: frozenset({S.IN_PROGRESS, S.CANCELLED}),
    S.IN_PROGRESS: frozenset({S.DELIVERED, S.CANCELLED}),
    S.DELIVERED: frozenset({S.IN_PROGRESS, S.COMPLETED}),  # back to in_progress = revision
    S.COMPLETED: frozenset(),
    S.CANCELLED: frozenset(),
    S.EXPIRED: frozenset(),
}

# Who may perform each edge. "system" = actor None (payment callback, Celery, ...).
SYSTEM, OWNER, COACH, ADMIN = "system", "owner", "coach", "admin"
TRANSITION_ACTORS: dict[tuple[str, str], frozenset[str]] = {
    (S.PENDING_PAYMENT, S.PAID): frozenset({SYSTEM, ADMIN}),
    (S.PENDING_PAYMENT, S.CANCELLED): frozenset({OWNER, SYSTEM, ADMIN}),
    (S.PENDING_PAYMENT, S.EXPIRED): frozenset({SYSTEM, ADMIN}),
    (S.PAID, S.QUESTIONNAIRE_PENDING): frozenset({SYSTEM, ADMIN}),
    (S.PAID, S.CANCELLED): frozenset({ADMIN}),
    (S.QUESTIONNAIRE_PENDING, S.IN_PROGRESS): frozenset({OWNER, ADMIN}),
    (S.QUESTIONNAIRE_PENDING, S.CANCELLED): frozenset({ADMIN}),
    (S.IN_PROGRESS, S.DELIVERED): frozenset({COACH, ADMIN}),
    (S.IN_PROGRESS, S.CANCELLED): frozenset({ADMIN}),
    (S.DELIVERED, S.IN_PROGRESS): frozenset({OWNER, ADMIN}),
    (S.DELIVERED, S.COMPLETED): frozenset({OWNER, SYSTEM, ADMIN}),
}

TIMESTAMP_FIELDS = {
    S.PAID: "paid_at",
    S.DELIVERED: "delivered_at",
    S.COMPLETED: "completed_at",
    S.CANCELLED: "cancelled_at",
    S.EXPIRED: "expired_at",
}


class InvalidTransition(APIException):
    status_code = http_status.HTTP_409_CONFLICT
    default_detail = "This status change is not allowed."
    default_code = "invalid_transition"


class OrderConflict(APIException):
    status_code = http_status.HTTP_409_CONFLICT
    default_detail = "Another order for this plan is being created. Try again."
    default_code = "order_conflict"


class NoCoachAvailable(Exception):
    pass


def actor_roles(order: Order, actor) -> set[str]:
    if actor is None:
        return {SYSTEM}
    roles = set()
    if actor.is_staff or actor.is_admin_role:
        roles.add(ADMIN)
    if order.user_id == actor.pk:
        roles.add(OWNER)
    if order.coach_id is not None and order.coach.user_id == actor.pk:
        roles.add(COACH)
    return roles


def _apply_side_effects(order: Order, from_status: str, to_status: str, now) -> list[str]:
    changed = []
    if field := TIMESTAMP_FIELDS.get(to_status):
        setattr(order, field, now)
        changed.append(field)

    if from_status == S.QUESTIONNAIRE_PENDING and to_status == S.IN_PROGRESS:
        # P3-07: deadline = questionnaire submission + delivery_days working days
        order.questionnaire_submitted_at = now
        order.program_due_at = add_business_days(now, int(order.snapshot["delivery_days"]))
        changed += ["questionnaire_submitted_at", "program_due_at"]

    if to_status == S.DELIVERED and order.starts_at is None:
        # P3-14: the program period starts at first delivery; a renewal starts
        # when the previous order ends if that is still in the future.
        start = now
        previous = order.renewed_from
        if previous is not None and previous.expires_at and previous.expires_at > now:
            start = previous.expires_at
        order.starts_at = start
        order.expires_at = start + timedelta(days=int(order.snapshot["duration_days"]))
        changed += ["starts_at", "expires_at"]

    return changed


def transition(order: Order, to_status: str, *, actor=None, note: str = "") -> Order:
    """
    The single entry point for status changes. In one transaction it:
    locks the row, re-reads the current status, checks the edge and the actor,
    updates the status (+ timestamps) and writes exactly one OrderStatusLog.
    """
    with transaction.atomic():
        locked = Order.objects.select_for_update().get(pk=order.pk)
        from_status = locked.status

        if to_status not in ALLOWED_TRANSITIONS.get(from_status, frozenset()):
            raise InvalidTransition(f"Cannot change status from {from_status} to {to_status}.")
        allowed_roles = TRANSITION_ACTORS.get((from_status, to_status), frozenset())
        if not (actor_roles(locked, actor) & allowed_roles):
            raise PermissionDenied("You are not allowed to perform this status change.")

        now = timezone.now()
        locked.status = to_status
        changed = _apply_side_effects(locked, from_status, to_status, now)
        locked._status_change_allowed = True
        locked.save(update_fields=["status", "updated_at", *changed])

        OrderStatusLog.objects.create(
            order=locked, from_status=from_status, to_status=to_status, actor=actor, note=note
        )

    order.refresh_from_db()
    order._remember_loaded_state()
    return order


# --- coach assignment (P3-06) ------------------------------------------------

def _active_order_count(coach_id: int, exclude_order_id: int | None = None) -> int:
    qs = Order.objects.filter(coach_id=coach_id, status__in=ACTIVE_STATUSES)
    if exclude_order_id:
        qs = qs.exclude(pk=exclude_order_id)
    return qs.count()


def _least_loaded_coach_ids() -> list[int]:
    return list(
        CoachProfile.objects.filter(is_active=True, user__is_active=True)
        .annotate(active_count=Count("orders", filter=Q(orders__status__in=ACTIVE_STATUSES)))
        .filter(active_count__lt=F("capacity"))
        .order_by("active_count", "display_order", "id")
        .values_list("id", flat=True)
    )


def assign_coach(order: Order) -> CoachProfile:
    """
    Priority: the plan's coach → the coach the athlete requested → the active coach
    with the fewest active orders that still has capacity.

    Concurrency: the annotated query above can't be locked (Postgres refuses
    FOR UPDATE with GROUP BY), so for each candidate we lock only that coach row
    and count again. A second request for the same coach waits on the lock and
    then sees the first assignment, so capacity is never exceeded.
    """
    if order.plan.coach_id:
        candidates = [order.plan.coach_id]  # plan is that coach's product: no fallback
    else:
        candidates = ([order.requested_coach_id] if order.requested_coach_id else []) + _least_loaded_coach_ids()

    seen = set()
    for coach_id in candidates:
        if coach_id in seen:
            continue
        seen.add(coach_id)
        with transaction.atomic():
            coach = CoachProfile.objects.select_for_update().select_related("user").get(pk=coach_id)
            if not (coach.is_active and coach.user.is_active):
                continue
            if _active_order_count(coach.pk, exclude_order_id=order.pk) >= coach.capacity:
                continue
            Order.objects.filter(pk=order.pk).update(coach=coach)
            order.coach = coach
            return coach

    raise NoCoachAvailable()


# --- create / pay / cancel ---------------------------------------------------

def build_snapshot(plan, pricing) -> dict:
    return {
        "plan_id": plan.pk,
        "slug": plan.slug,
        "title": plan.title,
        "type": plan.type,
        "duration_days": plan.duration_days,
        "delivery_days": plan.delivery_days,
        "revisions": plan.revisions,
        "support_days": plan.support_days,
        "features": list(plan.features),
        "price": plan.price,
        "compare_at_price": plan.compare_at_price,
        "coach_id": plan.coach_id,
        "discount_code": pricing.discount.code if pricing.discount else None,
        "discount_amount": pricing.discount_amount,
        "total": pricing.total,
    }


def _validate_coach(coach: CoachProfile | None, plan) -> None:
    if coach is None:
        return
    if not (coach.is_active and coach.user.is_active):
        raise ValidationError({"coach_id": ["This coach is not available."]})
    if plan.coach_id and plan.coach_id != coach.pk:
        raise ValidationError({"coach_id": ["This plan belongs to another coach."]})
    if _active_order_count(coach.pk) >= coach.capacity:
        raise ValidationError({"coach_id": ["This coach has no free capacity right now."]})


def _validate_renewal(previous: Order | None, user) -> None:
    if previous is None:
        return
    if previous.user_id != user.pk:
        raise ValidationError({"renewed_from": ["Order not found."]})
    if previous.status not in (S.DELIVERED, S.COMPLETED, S.EXPIRED):
        raise ValidationError({"renewed_from": ["Only delivered or finished orders can be renewed."]})


def create_order(*, user, plan, requested_coach=None, discount_code: str | None = None, renewed_from=None) -> Order:
    """
    P3-08/P3-09/P3-12. The price is always computed here, never taken from the client.
    """
    if not plan.is_active:
        raise ValidationError({"plan_id": ["This plan is not available."]})
    if plan.coach_id and not (plan.coach.is_active and plan.coach.user.is_active):
        raise ValidationError({"plan_id": ["This plan is not available."]})
    _validate_coach(requested_coach, plan)
    _validate_renewal(renewed_from, user)

    pricing = price_for(plan, user, discount_code)

    try:
        with transaction.atomic():
            # P3-09: cancel the previous pending order first, otherwise the
            # partial unique constraint would reject the new one.
            stale = Order.objects.select_for_update().filter(user=user, plan=plan, status=S.PENDING_PAYMENT)
            for old in stale:
                transition(old, S.CANCELLED, actor=None, note="Replaced by a new order.")

            order = Order(
                user=user,
                plan=plan,
                requested_coach=requested_coach,
                snapshot=build_snapshot(plan, pricing),
                subtotal=pricing.subtotal,
                discount_amount=pricing.discount_amount,
                total=pricing.total,
                discount_code=pricing.discount,
                renewed_from=renewed_from,
            )
            order.save()

            if order.total == 0:
                # P3-12: nothing to pay. Contract: no Payment row is created for
                # zero-total orders; paid_at + the status log are the record.
                mark_order_paid(order, actor=None, note="Zero total: paid without gateway.")
    except IntegrityError:
        # Two requests for the same user+plan raced past the cancel step.
        raise OrderConflict()

    return order


def mark_order_paid(order: Order, *, actor=None, note: str = "") -> Order:
    """
    Called after a successful payment (and for zero-total orders).
    Everything happens in one transaction: if the discount quota was used up by a
    concurrent payment, nothing is saved and InvalidDiscount is raised so the
    payment layer can refund or re-price.
    """
    with transaction.atomic():
        transition(order, S.PAID, actor=actor, note=note)

        if order.discount_code_id and order.discount_amount:
            consume_discount(
                discount_id=order.discount_code_id,
                user=order.user,
                order=order,
                amount=order.discount_amount,
            )

        try:
            assign_coach(order)
            assign_note = ""
        except NoCoachAvailable:
            # Payment must not fail because coaches are full: leave it unassigned
            # for an admin instead of exceeding anyone's capacity.
            assign_note = "No coach with free capacity; needs manual assignment."

        transition(order, S.QUESTIONNAIRE_PENDING, actor=None, note=assign_note)
    return order


def cancel_order(order: Order, *, actor) -> Order:
    return transition(order, S.CANCELLED, actor=actor, note="Cancelled by user.")


# --- revisions (P3-03 / P3-14) -------------------------------------------------

def request_revision(order: Order, *, user, note: str) -> RevisionRequest:
    with transaction.atomic():
        locked = Order.objects.select_for_update().get(pk=order.pk)
        if locked.user_id != user.pk:
            raise PermissionDenied("You can only request revisions for your own orders.")
        if locked.status != S.DELIVERED:
            raise ValidationError({"order": ["Revisions can only be requested for delivered orders."]})

        # Condition inside the UPDATE: two parallel requests can't both use the last revision.
        updated = Order.objects.filter(pk=locked.pk, revisions_used__lt=locked.revisions_allowed).update(
            revisions_used=F("revisions_used") + 1
        )
        if updated != 1:
            raise ValidationError({"order": ["No revisions left for this order."]})

        revision = RevisionRequest.objects.create(order=locked, coach_id=locked.coach_id, note=note)
        transition(locked, S.IN_PROGRESS, actor=user, note="Revision requested.")

    order.refresh_from_db()
    order._remember_loaded_state()
    return revision


def resolve_revision(revision: RevisionRequest, *, actor, accepted: bool, coach_note: str = "") -> RevisionRequest:
    """Coach (or admin) finishes a revision; the order goes back to delivered either way."""
    with transaction.atomic():
        revision = RevisionRequest.objects.select_for_update().get(pk=revision.pk)
        if revision.status != RevisionRequest.Status.PENDING:
            raise ValidationError({"revision": ["This revision is already resolved."]})

        order = revision.order
        if not ({COACH, ADMIN} & actor_roles(order, actor)):
            raise PermissionDenied("Only the order's coach can resolve this revision.")

        revision.status = RevisionRequest.Status.DONE if accepted else RevisionRequest.Status.REJECTED
        revision.coach_note = coach_note
        revision.resolved_at = timezone.now()
        revision.save(update_fields=["status", "coach_note", "resolved_at", "updated_at"])

        if not accepted:
            # A rejected request doesn't consume the athlete's revision quota.
            Order.objects.filter(pk=order.pk, revisions_used__gt=0).update(revisions_used=F("revisions_used") - 1)

        transition(order, S.DELIVERED, actor=actor, note=f"Revision {'done' if accepted else 'rejected'}.")
    return revision
