from django import forms
from django.contrib import admin
from django.db import models

from .models import FAQ, BlogCategory, SiteSettings, Testimonial


@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ("question", "category", "is_active", "display_order")
    list_editable = ("is_active", "display_order")
    list_filter = ("is_active", "category")


@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ("name", "rating", "is_active", "display_order")
    list_editable = ("is_active", "display_order")


@admin.register(BlogCategory)
class BlogCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "is_active", "display_order")
    list_editable = ("is_active", "display_order")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    # "instagram.com/x" -> "https://instagram.com/x" (Django 6 default; explicit to silence the warning)
    formfield_overrides = {models.URLField: {"form_class": forms.URLField, "assume_scheme": "https"}}

    def has_add_permission(self, request):
        return not SiteSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False
