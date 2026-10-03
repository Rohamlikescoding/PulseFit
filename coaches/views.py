import django_filters
from django.db.models import Prefetch
from rest_framework import generics, viewsets
from rest_framework.permissions import AllowAny

from .models import CoachCertificate, CoachProfile, CoachReview, Specialty
from .selectors import public_coaches
from .serializers import PublicCoachDetailSerializer, PublicCoachListSerializer, SpecialtySerializer


class CoachFilter(django_filters.FilterSet):
    specialty = django_filters.CharFilter(field_name="specialties__slug", distinct=True)
    gender = django_filters.ChoiceFilter(choices=CoachProfile.Gender.choices)

    class Meta:
        model = CoachProfile
        fields = ["specialty", "gender"]


class CoachViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    lookup_field = "slug"
    lookup_value_regex = r"[-\w]+"  # allow Persian slugs
    filterset_class = CoachFilter
    search_fields = ["display_name", "bio"]
    ordering_fields = ["display_order", "rating_avg", "years_of_experience"]
    ordering = ["display_order", "id"]

    def get_queryset(self):
        qs = public_coaches().prefetch_related(
            Prefetch(
                "specialties",
                queryset=Specialty.objects.filter(is_active=True),
                to_attr="public_specialties",
            )
        )
        if self.action == "retrieve":
            qs = qs.prefetch_related(
                Prefetch(
                    "certificates",
                    queryset=CoachCertificate.objects.filter(is_approved=True),
                    to_attr="public_certificates",
                ),
                Prefetch(
                    "reviews",
                    queryset=CoachReview.objects.filter(is_approved=True).order_by("-created_at"),
                    to_attr="public_reviews",
                ),
            )
        return qs

    def get_serializer_class(self):
        return PublicCoachDetailSerializer if self.action == "retrieve" else PublicCoachListSerializer


class SpecialtyListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = SpecialtySerializer
    pagination_class = None
    queryset = Specialty.objects.filter(is_active=True)
