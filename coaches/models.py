from decimal import Decimal

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.db.models import Q
from django.utils import timezone
from django.utils.text import slugify

from core.models import TimeStampedModel


def unique_slug(instance, value: str, max_length: int = 120) -> str:
 
    base = slugify(value, allow_unicode=True)[: max_length - 5] or "item"
    slug, n = base, 2
    model = type(instance)
    while model.objects.filter(slug=slug).exclude(pk=instance.pk).exists():
        slug, n = f"{base}-{n}", n + 1
    return slug


def validate_not_future_year(value):
    if value > timezone.now().year:
        raise ValidationError("Year cannot be in the future.")


class Specialty(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, allow_unicode=True)
    is_active = models.BooleanField(default=True)
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["display_order", "name"]
        verbose_name_plural = "specialties"

    def __str__(self):
        return self.name


class CoachProfile(TimeStampedModel):
    class Gender(models.TextChoices):
        MALE = "MALE", "Male"
        FEMALE = "FEMALE", "Female"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="coach_profile",
        
        limit_choices_to={"role": "COACH"},
    )
    display_name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=120, unique=True, allow_unicode=True, blank=True)
    bio = models.TextField(blank=True)
    photo = models.ImageField(upload_to="coaches/photos/", blank=True)
    gender = models.CharField(max_length=10, choices=Gender.choices, blank=True)
    specialties = models.ManyToManyField(Specialty, blank=True, related_name="coaches")
    years_of_experience = models.PositiveSmallIntegerField(default=0)
    
    capacity = models.PositiveSmallIntegerField(default=10)
    commission_percent = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("0"),
        validators=[MinValueValidator(Decimal("0")), MaxValueValidator(Decimal("100"))],
    )
    # Cached from approved reviews by coaches.services.refresh_coach_rating().
    rating_avg = models.DecimalField(max_digits=3, decimal_places=2, default=Decimal("0"))
    rating_count = models.PositiveIntegerField(default=0)
    # New coaches stay hidden until an admin activates them.
    is_active = models.BooleanField(default=False)
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["display_order", "id"]
        constraints = [
            models.CheckConstraint(
                condition=Q(commission_percent__gte=0, commission_percent__lte=100),
                name="coach_commission_range",
            ),
            models.CheckConstraint(
                condition=Q(rating_avg__gte=0, rating_avg__lte=5),
                name="coach_rating_range",
            ),
        ]

    def __str__(self):
        return self.display_name

    def clean(self):
        super().clean()
        self._validate_role()

    def _validate_role(self):
        if self.user_id and self.user.role != self.user.Role.COACH:
            raise ValidationError({"user": "Only users with role COACH can have a coach profile."})

    def save(self, *args, **kwargs):
        self._validate_role()
        if not self.slug:
            self.slug = unique_slug(self, self.display_name)
        super().save(*args, **kwargs)


class CoachCertificate(TimeStampedModel):
    coach = models.ForeignKey(CoachProfile, on_delete=models.CASCADE, related_name="certificates")
    title = models.CharField(max_length=200)
    issuer = models.CharField(max_length=200)
    year = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1950), validate_not_future_year],
    )
    image = models.ImageField(upload_to="coaches/certificates/", blank=True)
    is_approved = models.BooleanField(default=False)
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["display_order", "-year"]

    def __str__(self):
        return f"{self.title} ({self.coach})"


class CoachReview(TimeStampedModel):
    order = models.OneToOneField("orders.Order", on_delete=models.CASCADE, related_name="review")
    coach = models.ForeignKey(CoachProfile, on_delete=models.CASCADE, related_name="reviews")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="coach_reviews")
    rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True)
    is_approved = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.CheckConstraint(condition=Q(rating__gte=1, rating__lte=5), name="review_rating_range"),
        ]

    def __str__(self):
        return f"{self.rating}★ for {self.coach} (order {self.order_id})"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        from .services import refresh_coach_rating

        refresh_coach_rating(self.coach_id)

    def delete(self, *args, **kwargs):
        coach_id = self.coach_id
        result = super().delete(*args, **kwargs)
        from .services import refresh_coach_rating

        refresh_coach_rating(coach_id)
        return result
