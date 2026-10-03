from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import F, Q

from coaches.models import unique_slug
from core.models import TimeStampedModel


class Plan(TimeStampedModel):
    """
    A purchasable coaching plan. All money fields are integer Tomans (never float).
    coach=None means a coach is assigned automatically after payment.
    """

    class Type(models.TextChoices):
        WORKOUT = "workout", "Workout"
        DIET = "diet", "Diet"
        COMBO = "combo", "Workout + Diet"

    type = models.CharField(max_length=10, choices=Type.choices)
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=120, unique=True, allow_unicode=True, blank=True)
    description = models.TextField(blank=True)
    coach = models.ForeignKey(
        "coaches.CoachProfile",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="plans",
    )
    duration_days = models.PositiveSmallIntegerField()
    price = models.PositiveBigIntegerField()
    compare_at_price = models.PositiveBigIntegerField(null=True, blank=True)
    revisions = models.PositiveSmallIntegerField(default=1)
    support_days = models.PositiveSmallIntegerField(default=0)
    delivery_days = models.PositiveSmallIntegerField(default=3)
    features = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["display_order", "id"]
        constraints = [
            models.CheckConstraint(condition=Q(price__gt=0), name="plan_price_positive"),
            models.CheckConstraint(condition=Q(duration_days__gt=0), name="plan_duration_positive"),
            models.CheckConstraint(condition=Q(delivery_days__gt=0), name="plan_delivery_days_positive"),
            # F() compares two columns of the same row.
            models.CheckConstraint(
                condition=Q(compare_at_price__isnull=True) | Q(compare_at_price__gt=F("price")),
                name="plan_compare_at_price_gt_price",
            ),
        ]

    def __str__(self):
        return self.title

    def clean(self):
        super().clean()
        if not isinstance(self.features, list) or not all(isinstance(f, str) for f in self.features):
            raise ValidationError({"features": "Features must be a list of strings."})
        if self.compare_at_price is not None and self.price and self.compare_at_price <= self.price:
            raise ValidationError({"compare_at_price": "Must be greater than price."})

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = unique_slug(self, self.title)
        super().save(*args, **kwargs)
