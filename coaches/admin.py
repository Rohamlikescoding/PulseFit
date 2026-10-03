from django.contrib import admin

from .models import CoachCertificate, CoachProfile, CoachReview, Specialty


@admin.register(Specialty)
class SpecialtyAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "is_active", "display_order")
    list_editable = ("is_active", "display_order")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name",)


class CoachCertificateInline(admin.TabularInline):
    model = CoachCertificate
    extra = 0
    fields = ("title", "issuer", "year", "image", "is_approved", "display_order")


@admin.register(CoachProfile)
class CoachProfileAdmin(admin.ModelAdmin):
    list_display = ("display_name", "user", "is_active", "capacity", "rating_avg", "rating_count", "display_order")
    list_filter = ("is_active", "gender", "specialties")
    list_editable = ("is_active", "display_order")
    search_fields = ("display_name", "user__phone")
    filter_horizontal = ("specialties",)
    readonly_fields = ("rating_avg", "rating_count")
    raw_id_fields = ("user",)
    inlines = [CoachCertificateInline]


@admin.register(CoachReview)
class CoachReviewAdmin(admin.ModelAdmin):
    list_display = ("coach", "rating", "is_approved", "created_at")
    list_filter = ("is_approved", "rating")
    readonly_fields = ("order", "coach", "user", "rating", "comment", "created_at")
    actions = ["approve", "unapprove"]

    def has_add_permission(self, request):
        return False  

    @admin.action(description="Approve selected reviews")
    def approve(self, request, queryset):
        
        for review in queryset:
            review.is_approved = True
            review.save()

    @admin.action(description="Unapprove selected reviews")
    def unapprove(self, request, queryset):
        for review in queryset:
            review.is_approved = False
            review.save()
