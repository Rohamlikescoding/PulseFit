from django.db.models import Q

from .models import Plan


def public_plans():
    """Active plans whose coach (if any) is publicly visible."""
    return Plan.objects.filter(is_active=True).filter(
        Q(coach__isnull=True) | Q(coach__is_active=True, coach__user__is_active=True)
    )
