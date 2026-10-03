from decimal import Decimal

import pytest
from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from django.utils import timezone

from coaches.models import CoachCertificate, CoachProfile, CoachReview, Specialty
from coaches.services import refresh_coach_rating

pytestmark = pytest.mark.django_db


# ---------- P2-02: role=COACH enforced ----------

def test_profile_requires_coach_role_on_save(make_athlete):
    with pytest.raises(ValidationError):
        CoachProfile.objects.create(user=make_athlete(), display_name="Not a coach")


def test_profile_requires_coach_role_on_clean(make_athlete):
    profile = CoachProfile(user=make_athlete(), display_name="Not a coach")
    with pytest.raises(ValidationError) as exc:
        profile.full_clean()
    assert "user" in exc.value.message_dict


def test_user_can_have_only_one_profile(make_coach):
    coach = make_coach()
    with pytest.raises(IntegrityError), transaction.atomic():
        CoachProfile.objects.create(user=coach.user, display_name="Second")


def test_slug_is_generated_and_unique(make_coach):
    a = make_coach(display_name="علی رضایی")
    b = make_coach(display_name="علی رضایی")
    assert a.slug == "علی-رضایی"
    assert b.slug == "علی-رضایی-2"


def test_commission_constraint_in_database(make_coach):
    coach = make_coach()
    with pytest.raises(IntegrityError), transaction.atomic():
        CoachProfile.objects.filter(pk=coach.pk).update(commission_percent=Decimal("150"))


# ---------- P2-03: certificates ----------

def test_certificate_year_cannot_be_in_future(make_coach):
    cert = CoachCertificate(coach=make_coach(), title="CSCS", issuer="NSCA", year=timezone.now().year + 1)
    with pytest.raises(ValidationError) as exc:
        cert.full_clean()
    assert "year" in exc.value.message_dict


def test_certificate_defaults_to_unapproved(make_coach):
    cert = CoachCertificate.objects.create(coach=make_coach(), title="CSCS", issuer="NSCA", year=2020)
    assert cert.is_approved is False


# ---------- P2-04: rating cache ----------

def test_rating_cache_counts_only_approved_reviews(make_order, make_coach, make_plan, advance_order):
    coach = make_coach()
    plan = make_plan(coach=coach)
    orders = [advance_order(make_order(plan=plan), "delivered") for _ in range(3)]

    CoachReview.objects.create(order=orders[0], coach=coach, user=orders[0].user, rating=5, is_approved=True)
    CoachReview.objects.create(order=orders[1], coach=coach, user=orders[1].user, rating=4, is_approved=True)
    CoachReview.objects.create(order=orders[2], coach=coach, user=orders[2].user, rating=1, is_approved=False)

    coach.refresh_from_db()
    assert coach.rating_avg == Decimal("4.50")
    assert coach.rating_count == 2


def test_rating_cache_resets_when_review_deleted(make_order, make_coach, make_plan, advance_order):
    coach = make_coach()
    order = advance_order(make_order(plan=make_plan(coach=coach)), "delivered")
    review = CoachReview.objects.create(order=order, coach=coach, user=order.user, rating=3, is_approved=True)
    review.delete()
    refresh_coach_rating(coach.pk)
    coach.refresh_from_db()
    assert (coach.rating_avg, coach.rating_count) == (Decimal("0"), 0)


# ---------- admin (P2-01 / P2-03 done criteria) ----------

def test_specialty_manageable_in_admin(client, admin_user):
    client.force_login(admin_user)
    response = client.post(
        "/admin/coaches/specialty/add/",
        {"name": "Bodybuilding", "slug": "bodybuilding", "is_active": "on", "display_order": 0},
    )
    assert response.status_code == 302
    assert Specialty.objects.filter(slug="bodybuilding").exists()


def test_certificates_inline_in_coach_admin(client, admin_user, make_coach):
    coach = make_coach()
    CoachCertificate.objects.create(coach=coach, title="CSCS", issuer="NSCA", year=2020)
    client.force_login(admin_user)
    response = client.get(f"/admin/coaches/coachprofile/{coach.pk}/change/")
    assert response.status_code == 200
    assert b"certificates-TOTAL_FORMS" in response.content
    assert b"CSCS" in response.content


def test_admin_review_approve_action_updates_rating(client, admin_user, make_order, make_coach, make_plan, advance_order):
    coach = make_coach()
    order = advance_order(make_order(plan=make_plan(coach=coach)), "delivered")
    review = CoachReview.objects.create(order=order, coach=coach, user=order.user, rating=4)
    client.force_login(admin_user)
    client.post(
        "/admin/coaches/coachreview/",
        {"action": "approve", "_selected_action": [review.pk]},
    )
    coach.refresh_from_db()
    assert coach.rating_count == 1 and coach.rating_avg == Decimal("4.00")
