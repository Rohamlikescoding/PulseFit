from rest_framework import serializers

from .models import CoachCertificate, CoachProfile, CoachReview, Specialty


class SpecialtySerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialty
        fields = ["name", "slug"]


class PublicCertificateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CoachCertificate
        fields = ["title", "issuer", "year", "image"]


class PublicReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = CoachReview
        fields = ["rating", "comment", "created_at"]


class CoachSummarySerializer(serializers.ModelSerializer):

    class Meta:
        model = CoachProfile
        fields = ["slug", "display_name", "photo"]


class PublicCoachListSerializer(serializers.ModelSerializer):
    specialties = SpecialtySerializer(source="public_specialties", many=True, read_only=True)

    class Meta:
        model = CoachProfile
        fields = [
            "slug",
            "display_name",
            "photo",
            "gender",
            "specialties",
            "years_of_experience",
            "rating_avg",
            "rating_count",
        ]


class PublicCoachDetailSerializer(PublicCoachListSerializer):
    certificates = PublicCertificateSerializer(source="public_certificates", many=True, read_only=True)
    reviews = PublicReviewSerializer(source="public_reviews", many=True, read_only=True)

    class Meta(PublicCoachListSerializer.Meta):
        fields = PublicCoachListSerializer.Meta.fields + ["bio", "certificates", "reviews"]


class ReviewCreateSerializer(serializers.Serializer):
    rating = serializers.IntegerField(min_value=1, max_value=5)
    comment = serializers.CharField(required=False, allow_blank=True, max_length=2000)
