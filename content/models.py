from django.core.cache import cache
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from core.models import TimeStampedModel

SITE_SETTINGS_CACHE_KEY = "content:site_settings"


class FAQ(TimeStampedModel):
    question = models.CharField(max_length=300)
    answer = models.TextField()
    category = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["display_order", "id"]
        verbose_name = "FAQ"
        verbose_name_plural = "FAQs"

    def __str__(self):
        return self.question


class Testimonial(TimeStampedModel):
    name = models.CharField(max_length=100)
    text = models.TextField()
    rating = models.PositiveSmallIntegerField(
        null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    photo = models.ImageField(upload_to="testimonials/", blank=True)
    is_active = models.BooleanField(default=False)
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["display_order", "id"]

    def __str__(self):
        return self.name


class BlogCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, allow_unicode=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["display_order", "name"]
        verbose_name_plural = "blog categories"

    def __str__(self):
        return self.name


class SiteSettings(models.Model):
    """Singleton: always the row with pk=1. Use SiteSettings.load()."""

    site_name = models.CharField(max_length=100, default="Coach")
    support_phone = models.CharField(max_length=20, blank=True)
    support_email = models.EmailField(blank=True)
    instagram_url = models.URLField(blank=True)
    telegram_url = models.URLField(blank=True)
    about_text = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "site settings"
        verbose_name_plural = "site settings"

    def __str__(self):
        return "Site settings"

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)
        # Invalidate the public API cache so admin changes show up immediately.
        cache.delete(SITE_SETTINGS_CACHE_KEY)

    def delete(self, *args, **kwargs):
        raise ValueError("Site settings cannot be deleted.")

    @classmethod
    def load(cls) -> "SiteSettings":
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj
