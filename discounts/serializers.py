from rest_framework import serializers

from plans.selectors import public_plans


class DiscountValidateSerializer(serializers.Serializer):
    plan_id = serializers.PrimaryKeyRelatedField(queryset=public_plans(), source="plan")
    code = serializers.CharField(max_length=50)


class DiscountResultSerializer(serializers.Serializer):
    code = serializers.CharField()
    subtotal = serializers.IntegerField()
    discount_amount = serializers.IntegerField()
    total = serializers.IntegerField()
