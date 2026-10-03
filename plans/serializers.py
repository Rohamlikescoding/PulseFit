from rest_framework import serializers

from coaches.serializers import CoachSummarySerializer

from .models import Plan


class PublicPlanSerializer(serializers.ModelSerializer):
    coach = CoachSummarySerializer(read_only=True, allow_null=True)
    features = serializers.ListField(child=serializers.CharField(), read_only=True)

    class Meta:
        model = Plan
        fields = [
            "id",
            "slug",
            "title",
            "type",
            "description",
            "coach",
            "duration_days",
            "price",
            "compare_at_price",
            "revisions",
            "support_days",
            "delivery_days",
            "features",
            "is_featured",
        ]
