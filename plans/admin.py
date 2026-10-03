from django.contrib import admin

from .models import Plan


@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = ("title", "type", "coach", "price", "duration_days", "is_active", "is_featured", "display_order")
    list_filter = ("type", "is_active", "is_featured")
    list_editable = ("is_active", "is_featured", "display_order")
    search_fields = ("title", "slug")
    prepopulated_fields = {"slug": ("title",)}
    raw_id_fields = ("coach",)
