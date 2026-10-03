from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models
from django.db.models import F, Q
from django.db.models.functions import Lower
from django.utils import timezone

from core.models import TimeStampedModel


def normalize_code(raw: str) -> str:
    return (raw or "").strip().upper()


class DiscountCode(TimeStampedModel):
    class Type(models.TextChoices):
        PERCENT = "percent", "Percent"
        FIXED = "fixed", "Fixed amount"

    code = models.CharField(max_length=50)
    type = models.CharField(max_length=10, choices=Type.choices)
    # PERCENT: 1..100, FIXED: Tomans
    value = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    max_discount_amount = models.PositiveBigIntegerField(
        null=True, blank=True, help_text="Cap for percent discounts (Tomans)."
    )
    min_order_amount = models.PositiveBigIntegerField(default=0)
    # Valid when valid_from <= now < valid_until (valid_until empty = no end).
    valid_from = models.DateTimeField(default=timezone.now)
    valid_until = models.DateTimeField(null=True, blank=True)
    usage_limit = models.PositiveIntegerField(null=True, blank=True, help_text="Empty = unlimited.")
    used_count = models.PositiveIntegerField(default=0)
    per_user_limit = models.PositiveIntegerField(null=True, blank=True, default=1, help_text="Empty = unlimited.")
    plans = models.ManyToManyField(
        "plans.Plan", blank=True, related_name="discount_codes", help_text="Empty = all plans."
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        constraints = [
            # Functional unique constraint: "SUMMER" and "summer" cannot both exist.
            models.UniqueConstraint(Lower("code"), name="discount_code_ci_unique"),
            models.CheckConstraint(
                condition=Q(type="fixed") | Q(value__gte=1, value__lte=100),
                name="discount_percent_range",
            ),
            models.CheckConstraint(
                condition=Q(valid_until__isnull=True) | Q(valid_until__gt=F("valid_from")),
                name="discount_valid_range",
            ),
            models.CheckConstraint(
                condition=Q(usage_limit__isnull=True) | Q(used_count__lte=F("usage_limit")),
                name="discount_used_within_limit",
            ),
        ]

    def __str__(self):
        return self.code

    def save(self, *args, **kwargs):
        self.code = normalize_code(self.code)
        super().save(*args, **kwargs)

    def is_valid_at(self, now) -> bool:
        return (
            self.is_active
            and self.valid_from <= now
            and (self.valid_until is None or now < self.valid_until)
        )


class DiscountUsage(models.Model):
    """One row per paid order that used a code; written only by consume_discount()."""

    discount = models.ForeignKey(DiscountCode, on_delete=models.PROTECT, related_name="usages")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="discount_usages")
    order = models.OneToOneField("orders.Order", on_delete=models.CASCADE, related_name="discount_usage")
    amount = models.PositiveBigIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["discount", "user"], name="discount_usage_user_idx")]

    def __str__(self):
        return f"{self.discount} used on {self.order_id}"
