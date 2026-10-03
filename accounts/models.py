from decimal import Decimal

from django.conf import settings
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.db.models import Q
from django.utils import timezone

from core.models import TimeStampedModel
from core.utils import normalize_phone

from .managers import UserManager


class User(AbstractBaseUser, PermissionsMixin):
    class Role(models.TextChoices):
        ATHLETE = "ATHLETE", "Athlete"
        COACH = "COACH", "Coach"
        ADMIN = "ADMIN", "Admin"

    phone = models.CharField(
        max_length=15,
        unique=True,
        verbose_name="شماره موبایل",
    )
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.ATHLETE,
        verbose_name="نقش",
    )
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD = "phone"
    REQUIRED_FIELDS = []          

    class Meta:
        verbose_name = "کاربر"
        verbose_name_plural = "کاربران"

    def __str__(self):
        return self.phone

    def clean(self):
      
        super().clean()
        try:
            self.phone = normalize_phone(self.phone)
        except ValueError as exc:
            raise ValidationError({"phone": str(exc)}) from exc

    @property
    def is_athlete(self):
        return self.role == self.Role.ATHLETE

    @property
    def is_coach(self):
        return self.role == self.Role.COACH

    @property
    def is_admin_role(self):
        return self.role == self.Role.ADMIN


class OTPCode(TimeStampedModel):
    

    phone = models.CharField(max_length=15, verbose_name="شماره موبایل")
    code_hash = models.CharField(max_length=64, verbose_name="هش کد")
    expires_at = models.DateTimeField(verbose_name="زمان انقضا")
    attempts = models.PositiveSmallIntegerField(default=0, verbose_name="تلاش‌های ناموفق")
    is_used = models.BooleanField(default=False, verbose_name="مصرف شده")

    class Meta:
        verbose_name = "کد OTP"
        verbose_name_plural = "کدهای OTP"
        indexes = [
           
            models.Index(fields=["phone", "-created_at"], name="otp_phone_created_idx"),
        ]

    def __str__(self):
        return f"OTP for {self.phone} ({self.created_at:%Y-%m-%d %H:%M})"

    @property
    def is_expired(self) -> bool:
        return timezone.now() >= self.expires_at


class AthleteProfile(TimeStampedModel):
  
    class Gender(models.TextChoices):
        MALE = "MALE", "Male"
        FEMALE = "FEMALE", "Female"

    class ActivityLevel(models.TextChoices):
        SEDENTARY = "SEDENTARY", "Sedentary"
        LIGHT = "LIGHT", "Lightly active"
        MODERATE = "MODERATE", "Moderately active"
        ACTIVE = "ACTIVE", "Active"
        VERY_ACTIVE = "VERY_ACTIVE", "Very active"

    class Experience(models.TextChoices):
        BEGINNER = "BEGINNER", "Beginner"
        INTERMEDIATE = "INTERMEDIATE", "Intermediate"
        ADVANCED = "ADVANCED", "Advanced"

    class Goal(models.TextChoices):
        FAT_LOSS = "FAT_LOSS", "Fat loss"
        MUSCLE_GAIN = "MUSCLE_GAIN", "Muscle gain"
        STRENGTH = "STRENGTH", "Strength"
        ENDURANCE = "ENDURANCE", "Endurance"
        GENERAL_FITNESS = "GENERAL_FITNESS", "General fitness"

    class TrainingPlace(models.TextChoices):
        GYM = "GYM", "Gym"
        HOME = "HOME", "Home"
        OUTDOOR = "OUTDOOR", "Outdoor"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="athlete_profile",
    )
    gender = models.CharField(max_length=10, choices=Gender.choices, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    height_cm = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(100), MaxValueValidator(250)],
    )
    weight_kg = models.DecimalField(
        max_digits=4,
        decimal_places=1,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal("30")), MaxValueValidator(Decimal("300"))],
    )
    activity_level = models.CharField(max_length=20, choices=ActivityLevel.choices, blank=True)
    experience = models.CharField(max_length=20, choices=Experience.choices, blank=True)
    goal = models.CharField(max_length=20, choices=Goal.choices, blank=True)
    training_place = models.CharField(max_length=10, choices=TrainingPlace.choices, blank=True)
    days_per_week = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(2), MaxValueValidator(7)],
    )
    injuries = models.TextField(blank=True)
    medical_conditions = models.TextField(blank=True)

    class Meta:
        verbose_name = "پروفایل شاگرد"
        verbose_name_plural = "پروفایل‌های شاگرد"
        
        constraints = [
            models.CheckConstraint(
                condition=Q(days_per_week__isnull=True) | Q(days_per_week__gte=2, days_per_week__lte=7),
                name="athlete_days_per_week_range",
            ),
            models.CheckConstraint(
                condition=Q(height_cm__isnull=True) | Q(height_cm__gte=100, height_cm__lte=250),
                name="athlete_height_cm_range",
            ),
            models.CheckConstraint(
                condition=Q(weight_kg__isnull=True) | Q(weight_kg__gte=30, weight_kg__lte=300),
                name="athlete_weight_kg_range",
            ),
        ]

    def __str__(self):
        return f"Profile of {self.user}"
