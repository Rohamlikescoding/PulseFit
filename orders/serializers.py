from rest_framework import serializers

from coaches.selectors import public_coaches
from coaches.serializers import CoachSummarySerializer
from plans.selectors import public_plans

from .models import Order, OrderStatusLog, RevisionRequest


class OrderCreateSerializer(serializers.Serializer):
    plan_id = serializers.PrimaryKeyRelatedField(queryset=public_plans(), source="plan")
    coach_id = serializers.PrimaryKeyRelatedField(
        queryset=public_coaches(), source="requested_coach", required=False, allow_null=True
    )
    discount_code = serializers.CharField(required=False, allow_blank=True, max_length=50)
    renewed_from = serializers.SlugRelatedField(
        slug_field="number", queryset=Order.objects.none(), required=False, allow_null=True
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Ownership filter: you can only renew your own orders.
        request = self.context.get("request")
        if request is not None and request.user.is_authenticated:
            self.fields["renewed_from"].queryset = Order.objects.filter(user=request.user)


class OrderStatusLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderStatusLog
        fields = ["from_status", "to_status", "note", "created_at"]


class RevisionRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = RevisionRequest
        fields = ["id", "status", "note", "coach_note", "created_at", "resolved_at"]
        read_only_fields = ["id", "status", "coach_note", "created_at", "resolved_at"]


class OrderListSerializer(serializers.ModelSerializer):
    plan_title = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ["number", "status", "plan_title", "total", "created_at"]

    def get_plan_title(self, obj) -> str:
        # From the snapshot: what the user bought, even if the plan was renamed later.
        return obj.snapshot.get("title", "")


class OrderDetailSerializer(OrderListSerializer):
    coach = CoachSummarySerializer(read_only=True, allow_null=True)
    renewed_from = serializers.SlugRelatedField(slug_field="number", read_only=True)
    status_logs = OrderStatusLogSerializer(many=True, read_only=True)
    revision_requests = RevisionRequestSerializer(many=True, read_only=True)
    revisions_allowed = serializers.IntegerField(read_only=True)
    can_request_revision = serializers.BooleanField(read_only=True)

    class Meta(OrderListSerializer.Meta):
        fields = OrderListSerializer.Meta.fields + [
            "snapshot",
            "subtotal",
            "discount_amount",
            "coach",
            "paid_at",
            "questionnaire_submitted_at",
            "program_due_at",
            "delivered_at",
            "completed_at",
            "cancelled_at",
            "starts_at",
            "expires_at",
            "renewed_from",
            "revisions_used",
            "revisions_allowed",
            "can_request_revision",
            "status_logs",
            "revision_requests",
        ]
