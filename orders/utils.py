from datetime import datetime, timedelta

from django.utils import timezone

FRIDAY = 4  # datetime.weekday(): Monday=0 ... Sunday=6


def add_business_days(start: datetime, days: int) -> datetime:
    """
    Move `days` working days forward from `start`, skipping Fridays.
    The weekday is decided in local time (settings.TIME_ZONE = Asia/Tehran):
    22:00 UTC on Thursday is already Friday in Tehran.
    The time of day is kept: Saturday 10:00 + 1 day = Sunday 10:00.
    """
    if days < 0:
        raise ValueError("days must be >= 0")
    result = timezone.localtime(start)
    added = 0
    while added < days:
        result += timedelta(days=1)
        if result.weekday() != FRIDAY:
            added += 1
    return result
