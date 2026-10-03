from datetime import date

from django.db import transaction
from rest_framework import serializers

from core.utils import normalize_phone

from .models import AthleteProfile, User


class PhoneField(serializers.CharField):
    

    def to_internal_value(self, data):
        value = super().to_internal_value(data)
        try:
            return normalize_phone(value)
        except ValueError:
            raise serializers.ValidationError("Enter a valid Iranian mobile number.")


class OTPRequestSerializer(serializers.Serializer):
    phone = PhoneField()


class OTPRequestResponseSerializer(serializers.Serializer):
    detail = serializers.CharField()
    expires_in = serializers.IntegerField()


class OTPVerifySerializer(serializers.Serializer):
    phone = PhoneField()
    code = serializers.RegexField(
        r"^\d{5}$",
        error_messages={"invalid": "Code must be 5 digits."},
    )


class TokenPairResponseSerializer(serializers.Serializer):
    access = serializers.CharField()
    refresh = serializers.CharField()
    is_new_user = serializers.BooleanField()


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()


class AthleteProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = AthleteProfile
        fields = [
            "gender",
            "birth_date",
            "height_cm",
            "weight_kg",
            "activity_level",
            "experience",
            "goal",
            "training_place",
            "days_per_week",
            "injuries",
            "medical_conditions",
            "updated_at",
        ]
        read_only_fields = ["updated_at"]

    def validate_birth_date(self, value):
        if value is None:
            return value
        today = date.today()
        age = today.year - value.year - ((today.month, today.day) < (value.month, value.day))
        if not 10 <= age <= 90:
            raise serializers.ValidationError("Age must be between 10 and 90.")
        return value


class MeSerializer(serializers.ModelSerializer):
    athlete_profile = AthleteProfileSerializer(required=False, allow_null=True)

    class Meta:
        model = User
        fields = ["id", "phone", "role", "date_joined", "athlete_profile"]
       
        read_only_fields = ["id", "phone", "role", "date_joined"]

    def validate_athlete_profile(self, value):
        if value and not self.instance.is_athlete:
            raise serializers.ValidationError("Only athletes have an athlete profile.")
        return value

    @transaction.atomic
    def update(self, instance, validated_data):
        
        profile_data = validated_data.pop("athlete_profile", None)
        instance = super().update(instance, validated_data)

        if profile_data:
            profile, _ = AthleteProfile.objects.get_or_create(user=instance)
            for field, value in profile_data.items():
                setattr(profile, field, value)
            profile.save()

        return instance
