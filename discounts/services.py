from dataclasses import dataclass
from decimal import Decimal

from django.db import transaction
from django.db.models import F
from django.utils import timezone
from rest_framework import status
from rest_framework.exceptions import APIException

from core.utils import money_round

from .models import DiscountCode, DiscountUsage, normalize_code


class InvalidDiscount(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "This discount code is not valid."
    default_code = "invalid_discount"

    def __init__(self, detail=None, code=None):
        super().__init__(detail, code)
        # Keep the specific reason (e.g. "discount_expired") as the response "code".
        if code:
            self.default_code = code


@dataclass(frozen=True)
class PriceResult:
    subtotal: int
    discount_amount: int
    total: int
    discount: DiscountCode | None = None


def find_discount(raw_code: str) -> DiscountCode:
    try:
        return DiscountCode.objects.get(code__iexact=normalize_code(raw_code))
    except DiscountCode.DoesNotExist:
        raise InvalidDiscount("Discount code not found.", "discount_not_found")


def _user_usage_count(discount: DiscountCode, user) -> int:
    return DiscountUsage.objects.filter(discount=discount, user=user).count()


def calculate_discount(discount: DiscountCode, plan, user, now=None) -> PriceResult:
    """
    Pure calculation: checks every rule and returns the price. Never writes anything,
    so the validate API (P3-10) and create_order share exactly the same logic.
    """
    now = now or timezone.now()
    subtotal = plan.price

    if not discount.is_active:
        raise InvalidDiscount("This discount code is not active.", "discount_inactive")
    if now < discount.valid_from:
        raise InvalidDiscount("This discount code is not valid yet.", "discount_not_started")
    if discount.valid_until is not None and now >= discount.valid_until:
        raise InvalidDiscount("This discount code has expired.", "discount_expired")
    if discount.plans.exists() and not discount.plans.filter(pk=plan.pk).exists():
        raise InvalidDiscount("This discount code does not apply to this plan.", "discount_plan_mismatch")
    if subtotal < discount.min_order_amount:
        raise InvalidDiscount("Order amount is below the minimum for this code.", "discount_min_amount")
    if discount.usage_limit is not None and discount.used_count >= discount.usage_limit:
        raise InvalidDiscount("This discount code has been fully used.", "discount_quota_exhausted")
    if discount.per_user_limit is not None and _user_usage_count(discount, user) >= discount.per_user_limit:
        raise InvalidDiscount("You have already used this discount code.", "discount_user_limit")

    if discount.type == DiscountCode.Type.PERCENT:
        amount = int(money_round(Decimal(subtotal) * discount.value / 100))
        if discount.max_discount_amount is not None:
            amount = min(amount, discount.max_discount_amount)
    else:
        amount = discount.value
    amount = min(amount, subtotal)  # total can never go negative

    return PriceResult(subtotal=subtotal, discount_amount=amount, total=subtotal - amount, discount=discount)


def price_for(plan, user, raw_code: str | None = None, now=None) -> PriceResult:
    if not raw_code or not raw_code.strip():
        return PriceResult(subtotal=plan.price, discount_amount=0, total=plan.price)
    return calculate_discount(find_discount(raw_code), plan, user, now)


def consume_discount(*, discount_id: int, user, order, amount: int) -> DiscountUsage:
    """
    Record one use of a code when an order is paid (P3-11). Safe under concurrency:
      - select_for_update locks the code row, so two payments of the same user
        are counted one after the other (per-user limit);
      - the UPDATE carries the quota condition, so used_count can never pass
        usage_limit even if two requests get here at the same moment.
    Must be called inside the payment transaction.
    """
    with transaction.atomic():
        discount = DiscountCode.objects.select_for_update().get(pk=discount_id)

        if discount.per_user_limit is not None and _user_usage_count(discount, user) >= discount.per_user_limit:
            raise InvalidDiscount("You have already used this discount code.", "discount_user_limit")

        qs = DiscountCode.objects.filter(pk=discount.pk)
        if discount.usage_limit is not None:
            qs = qs.filter(used_count__lt=F("usage_limit"))
        if qs.update(used_count=F("used_count") + 1) != 1:
            raise InvalidDiscount("This discount code has been fully used.", "discount_quota_exhausted")

        return DiscountUsage.objects.create(discount=discount, user=user, order=order, amount=amount)
