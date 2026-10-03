import pytest

from coaches.models import CoachReview

pytestmark = pytest.mark.django_db


def review_url(order):
    return f"/api/v1/orders/{order.number}/review/"


@pytest.fixture
def delivered_order(make_coach, make_plan, make_order, advance_order):
    coach = make_coach()
    return advance_order(make_order(plan=make_plan(coach=coach)), "delivered")


def test_buyer_can_review_delivered_order(auth_client, delivered_order):
    response = auth_client(delivered_order.user).post(
        review_url(delivered_order), {"rating": 5, "comment": "Great"}, format="json"
    )
    assert response.status_code == 201
    review = CoachReview.objects.get(order=delivered_order)
    # coach/user come from the order, and the review waits for approval
    assert review.coach_id == delivered_order.coach_id
    assert review.user_id == delivered_order.user_id
    assert review.is_approved is False


def test_only_once_per_order(auth_client, delivered_order):
    client = auth_client(delivered_order.user)
    assert client.post(review_url(delivered_order), {"rating": 5}, format="json").status_code == 201
    second = client.post(review_url(delivered_order), {"rating": 4}, format="json")
    assert second.status_code == 400
    assert CoachReview.objects.filter(order=delivered_order).count() == 1


def test_other_user_cannot_review(auth_client, make_athlete, delivered_order):
    response = auth_client(make_athlete()).post(review_url(delivered_order), {"rating": 5}, format="json")
    assert response.status_code == 404
    assert not CoachReview.objects.exists()


def test_cannot_review_before_delivery(auth_client, make_coach, make_plan, make_order):
    order = make_order(plan=make_plan(coach=make_coach()))
    response = auth_client(order.user).post(review_url(order), {"rating": 5}, format="json")
    assert response.status_code == 400


@pytest.mark.parametrize("rating", [0, 6])
def test_rating_range(auth_client, delivered_order, rating):
    response = auth_client(delivered_order.user).post(review_url(delivered_order), {"rating": rating}, format="json")
    assert response.status_code == 400
