from .models import CoachProfile


def public_coaches():
    return CoachProfile.objects.filter(is_active=True, user__is_active=True, user__role="COACH")
