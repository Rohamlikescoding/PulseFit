from rest_framework import serializers

from .models import FAQ, BlogCategory, SiteSettings, Testimonial


class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = ["id", "question", "answer", "category"]


class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = ["id", "name", "text", "rating", "photo"]


class BlogCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogCategory
        fields = ["name", "slug", "description"]


class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = ["site_name", "support_phone", "support_email", "instagram_url", "telegram_url", "about_text"]
