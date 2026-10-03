import django_filters
from rest_framework import viewsets
from rest_framework.permissions import AllowAny

from .models import Plan
from .selectors import public_plans
from .serializers import PublicPlanSerializer


class PlanFilter(django_filters.FilterSet):
    type = django_filters.ChoiceFilter(choices=Plan.Type.choices)
    coach = django_filters.CharFilter(field_name="coach__slug")

    class Meta:
        model = Plan
        fields = ["type", "coach", "is_featured"]


class PlanViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    serializer_class = PublicPlanSerializer
    lookup_field = "slug"
    lookup_value_regex = r"[-\w]+"
    filterset_class = PlanFilter
    search_fields = ["title", "description"]
    ordering_fields = ["display_order", "price", "duration_days"]
    ordering = ["display_order", "id"]

    def get_queryset(self):
        return public_plans().select_related("coach")
