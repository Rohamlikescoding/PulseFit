from decimal import ROUND_HALF_UP, Decimal

from django.db import IntegrityError, transaction
from django.db.models import Avg, Count
from rest_framework.exceptions import ValidationError

from .models import CoachProfile, CoachReview

REVIEWABLE_STATUSES = ("delivered", "completed")


def refresh_coach_rating(coach_id: int) -> None:
    stats = CoachReview.objects.filter(coach_id=coach_id, is_approved=True).aggregate(
        avg=Avg("rating"), count=Count("id")
    )
    avg = Decimal(str(stats["avg"] or 0)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    CoachProfile.objects.filter(pk=coach_id).update(rating_avg=avg, rating_count=stats["count"])


def create_review(*, order, user, rating: int, comment: str = "") -> CoachReview:
 
    if order.user_id != user.pk:
        raise ValidationError({"order": ["You can only review your own orders."]})
    if order.status not in REVIEWABLE_STATUSES:
        raise ValidationError({"order": ["This order cannot be reviewed yet."]})
    if order.coach_id is None:
        raise ValidationError({"order": ["This order has no coach to review."]})

    try:
        with transaction.atomic():
            return CoachReview.objects.create(
                order=order,
                coach_id=order.coach_id,
                user=user,
                rating=rating,
                comment=comment,
            )
    except IntegrityError:
        raise ValidationError({"order": ["This order has already been reviewed."]})
