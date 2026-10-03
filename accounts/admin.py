from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

from .models import AthleteProfile, OTPCode, User


class AthleteProfileInline(admin.StackedInline):
    model = AthleteProfile
    can_delete = False
    extra = 0


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    ordering = ("phone",)
    list_display = ("phone", "role", "is_staff", "is_active", "date_joined")
    search_fields = ("phone",)
    list_filter = ("role", "is_staff", "is_active")
    inlines = [AthleteProfileInline]
    fieldsets = (
        (None, {"fields": ("phone", "password")}),
        (_("Permissions"), {
            "fields": (
                "is_active",
                "is_staff",
                "is_superuser",
                "role",
                "groups",
                "user_permissions",
            )
        }),
        (_("Dates"), {"fields": ("date_joined", "last_login")}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("phone", "password1", "password2", "role", "is_staff", "is_active"),
        }),
    )


@admin.register(OTPCode)
class OTPCodeAdmin(admin.ModelAdmin):
    

    list_display = ("phone", "created_at", "expires_at", "attempts", "is_used")
    list_filter = ("is_used",)
    search_fields = ("phone",)
    exclude = ("code_hash",)
    readonly_fields = ("phone", "created_at", "expires_at", "attempts", "is_used")

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False
