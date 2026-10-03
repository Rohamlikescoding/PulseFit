import copy
import secrets

from django.conf import settings
from django.db import models
from django.db.models import F, Q
from django.utils import timezone

from core.models import TimeStampedModel


class OrderStatus(models.TextChoices):
    PENDING_PAYMENT = "pending_payment", "Pending payment"
    PAID = "paid", "Paid"
    QUESTIONNAIRE_PENDING = "questionnaire_pending", "Questionnaire pending"
    IN_PROGRESS = "in_progress", "In progress"
    DELIVERED = "delivered", "Delivered"
    COMPLETED = "completed", "Completed"
    CANCELLED = "cancelled", "Cancelled"
    EXPIRED = "expired", "Expired"


ACTIVE_STATUSES = (
    OrderStatus.PAID,
    OrderStatus.QUESTIONNAIRE_PENDING,
    OrderStatus.IN_PROGRESS,
    OrderStatus.DELIVERED,
)


class ImmutableFieldError(ValueError):
    pass


def generate_order_number() -> str:
    return f"ORD-{timezone.now():%y%m%d}-{secrets.token_hex(3).upper()}"


class Order(TimeStampedModel):
    number = models.CharField(max_length=20, unique=True, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="orders")
    plan = models.ForeignKey("plans.Plan", on_delete=models.PROTECT, related_name="orders")
    # Coach the athlete asked for (validated at creation); the real one is `coach`.
    requested_coach = models.ForeignKey(
        "coaches.CoachProfile", null=True, blank=True, on_delete=models.SET_NULL, related_name="+"
    )
    coach = models.ForeignKey(
        "coaches.CoachProfile", null=True, blank=True, on_delete=models.SET_NULL, related_name="orders"
    )
    # Only orders/services.py::transition may change this after creation.
    status = models.CharField(
        max_length=30, choices=OrderStatus.choices, default=OrderStatus.PENDING_PAYMENT, db_index=True
    )
    # Copy of the plan and price at purchase time; never changes afterwards.
    snapshot = models.JSONField(editable=False)

    subtotal = models.PositiveBigIntegerField()
    discount_amount = models.PositiveBigIntegerField(default=0)
    total = models.PositiveBigIntegerField()
    discount_code = models.ForeignKey(
        "discounts.DiscountCode", null=True, blank=True, on_delete=models.SET_NULL, related_name="orders"
    )

    paid_at = models.DateTimeField(null=True, blank=True)
    questionnaire_submitted_at = models.DateTimeField(null=True, blank=True)
    program_due_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    expired_at = models.DateTimeField(null=True, blank=True)

    # Renewal chain and program period (P3-14)
    renewed_from = models.ForeignKey(
        "self", null=True, blank=True, on_delete=models.SET_NULL, related_name="renewals"
    )
    starts_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    revisions_used = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "-created_at"], name="order_user_created_idx"),
            models.Index(fields=["coach", "status"], name="order_coach_status_idx"),
        ]
        constraints = [
            models.CheckConstraint(
                condition=Q(total=F("subtotal") - F("discount_amount")),
                name="order_total_consistent",
            ),
            models.CheckConstraint(
                condition=Q(discount_amount__lte=F("subtotal")),
                name="order_discount_lte_subtotal",
            ),
            # Partial unique constraint: at most one pending_payment order per user+plan.
            models.UniqueConstraint(
                fields=["user", "plan"],
                condition=Q(status="pending_payment"),
                name="order_one_pending_per_user_plan",
            ),
        ]

    def __str__(self):
        return self.number

    # --- immutability guards -------------------------------------------------

    @classmethod
    def from_db(cls, db, field_names, values):
        instance = super().from_db(db, field_names, values)
        instance._remember_loaded_state()
        return instance

    def _remember_loaded_state(self):
        self._loaded_status = self.status
        # deepcopy: otherwise order.snapshot["x"] = ... would also change this copy
        # (same dict object) and the change would go unnoticed.
        self._loaded_snapshot = copy.deepcopy(self.snapshot)
        self._status_change_allowed = False

    def save(self, *args, **kwargs):
        if self._state.adding:
            if self.status != OrderStatus.PENDING_PAYMENT:
                raise ImmutableFieldError("New orders must start as pending_payment.")
            if not self.number:
                self.number = self._new_unique_number()
        else:
            if self.snapshot != getattr(self, "_loaded_snapshot", self.snapshot):
                raise ImmutableFieldError("Order snapshot cannot be changed after creation.")
            if self.status != getattr(self, "_loaded_status", self.status) and not getattr(
                self, "_status_change_allowed", False
            ):
                raise ImmutableFieldError("Use orders.services.transition() to change status.")
        super().save(*args, **kwargs)
        self._remember_loaded_state()

    @classmethod
    def _new_unique_number(cls) -> str:
        for _ in range(10):
            number = generate_order_number()
            if not cls.objects.filter(number=number).exists():
                return number
        raise RuntimeError("Could not generate a unique order number.")

    # --- revisions -----------------------------------------------------------

    @property
    def revisions_allowed(self) -> int:
        return int(self.snapshot.get("revisions", 0))

    @property
    def can_request_revision(self) -> bool:
        return self.status == OrderStatus.DELIVERED and self.revisions_used < self.revisions_allowed


class OrderStatusLog(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="status_logs")
    from_status = models.CharField(max_length=30, choices=OrderStatus.choices)
    to_status = models.CharField(max_length=30, choices=OrderStatus.choices)
    # None = system (Celery, payment callback, ...)
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="+"
    )
    note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at", "id"]
        indexes = [models.Index(fields=["order", "created_at"], name="order_log_order_created_idx")]

    def __str__(self):
        return f"{self.order_id}: {self.from_status} -> {self.to_status}"


class RevisionRequest(TimeStampedModel):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        DONE = "done", "Done"
        REJECTED = "rejected", "Rejected"

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="revision_requests")
    # Copied from order.coach at creation so it stays traceable if the order's coach changes.
    coach = models.ForeignKey(
        "coaches.CoachProfile", null=True, blank=True, on_delete=models.SET_NULL, related_name="revision_requests"
    )
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    note = models.TextField()
    coach_note = models.TextField(blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Revision for {self.order_id} ({self.status})"
