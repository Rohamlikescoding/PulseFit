from datetime import datetime
from zoneinfo import ZoneInfo

import pytest

from orders.utils import add_business_days

TEHRAN = ZoneInfo("Asia/Tehran")
UTC = ZoneInfo("UTC")


def tehran(y, m, d, h=10, minute=0):
    return datetime(y, m, d, h, minute, tzinfo=TEHRAN)


# 2026-10-03 is a Saturday. Week: Sat 3, Sun 4, Mon 5, Tue 6, Wed 7, Thu 8, Fri 9, Sat 10.
@pytest.mark.parametrize(
    "start, days, expected",
    [
        (tehran(2026, 10, 3), 1, tehran(2026, 10, 4)),    # Sat -> Sun
        (tehran(2026, 10, 4), 1, tehran(2026, 10, 5)),    # Sun -> Mon
        (tehran(2026, 10, 5), 1, tehran(2026, 10, 6)),    # Mon -> Tue
        (tehran(2026, 10, 6), 1, tehran(2026, 10, 7)),    # Tue -> Wed
        (tehran(2026, 10, 7), 1, tehran(2026, 10, 8)),    # Wed -> Thu
        (tehran(2026, 10, 8), 1, tehran(2026, 10, 10)),   # Thu -> Sat (Friday skipped)
        (tehran(2026, 10, 9), 1, tehran(2026, 10, 10)),   # Fri -> Sat
        (tehran(2026, 10, 7), 3, tehran(2026, 10, 11)),   # Wed +3 = Thu, Sat, Sun
        (tehran(2026, 10, 3), 7, tehran(2026, 10, 11)),   # a full week has 6 working days
        (tehran(2026, 10, 3), 0, tehran(2026, 10, 3)),
    ],
)
def test_weekdays(start, days, expected):
    assert add_business_days(start, days) == expected


def test_midnight_boundary_thursday_night():
    # 23:59 Thursday is still Thursday: +1 skips Friday -> Saturday 23:59
    assert add_business_days(tehran(2026, 10, 8, 23, 59), 1) == tehran(2026, 10, 10, 23, 59)


def test_midnight_boundary_friday_start():
    # 00:00 Friday counts as Friday: +1 -> Saturday 00:00
    assert add_business_days(tehran(2026, 10, 9, 0, 0), 1) == tehran(2026, 10, 10, 0, 0)


def test_utc_input_is_judged_in_tehran_time():
    # 21:00 UTC Thursday = 00:30 Friday in Tehran -> next working day is Saturday 00:30
    start = datetime(2026, 10, 8, 21, 0, tzinfo=UTC)
    assert add_business_days(start, 1) == tehran(2026, 10, 10, 0, 30)


def test_negative_days_rejected():
    with pytest.raises(ValueError):
        add_business_days(tehran(2026, 10, 3), -1)
