from django.contrib import admin

from .models import DiscountCode, DiscountUsage


@admin.register(DiscountCode)
class DiscountCodeAdmin(admin.ModelAdmin):
    list_display = ("code", "type", "value", "used_count", "usage_limit", "valid_from", "valid_until", "is_active")
    list_filter = ("type", "is_active")
    search_fields = ("code",)
    filter_horizontal = ("plans",)
    # used_count only changes through consume_discount().
    readonly_fields = ("used_count",)


@admin.register(DiscountUsage)
class DiscountUsageAdmin(admin.ModelAdmin):
    list_display = ("discount", "user", "order", "amount", "created_at")
    search_fields = ("discount__code", "user__phone", "order__number")

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
