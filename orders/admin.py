from django.contrib import admin

from .models import Order, OrderStatusLog, RevisionRequest


class OrderStatusLogInline(admin.TabularInline):
    model = OrderStatusLog
    extra = 0
    can_delete = False
    readonly_fields = ("from_status", "to_status", "actor", "note", "created_at")

    def has_add_permission(self, request, obj=None):
        return False


class RevisionRequestInline(admin.TabularInline):
    model = RevisionRequest
    extra = 0
    readonly_fields = ("coach", "status", "note", "coach_note", "created_at", "resolved_at")
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("number", "user", "plan", "coach", "status", "total", "created_at")
    list_filter = ("status",)
    search_fields = ("number", "user__phone")
    raw_id_fields = ("coach",)
    # status, money and snapshot are read-only: status changes go through
    # orders.services.transition() so they are validated and logged.
    readonly_fields = (
        "number", "user", "plan", "requested_coach", "status", "snapshot",
        "subtotal", "discount_amount", "total", "discount_code",
        "paid_at", "questionnaire_submitted_at", "program_due_at", "delivered_at",
        "completed_at", "cancelled_at", "expired_at",
        "renewed_from", "starts_at", "expires_at", "revisions_used",
        "created_at", "updated_at",
    )
    inlines = [OrderStatusLogInline, RevisionRequestInline]

    def has_add_permission(self, request):
        return False  # orders are created through create_order()
