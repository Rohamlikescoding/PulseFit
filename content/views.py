from django.core.cache import cache
from drf_spectacular.utils import extend_schema
from rest_framework import generics, viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import FAQ, SITE_SETTINGS_CACHE_KEY, BlogCategory, SiteSettings, Testimonial
from .serializers import BlogCategorySerializer, FAQSerializer, SiteSettingsSerializer, TestimonialSerializer


class PublicListView(generics.ListAPIView):
    """Short public lists: no auth, no pagination, only active rows."""

    permission_classes = [AllowAny]
    pagination_class = None


class FAQListView(PublicListView):
    serializer_class = FAQSerializer
    queryset = FAQ.objects.filter(is_active=True)


class TestimonialListView(PublicListView):
    serializer_class = TestimonialSerializer
    queryset = Testimonial.objects.filter(is_active=True)


class BlogCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    pagination_class = None
    serializer_class = BlogCategorySerializer
    lookup_field = "slug"
    lookup_value_regex = r"[-\w]+"
    queryset = BlogCategory.objects.filter(is_active=True)


class SiteSettingsView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(responses=SiteSettingsSerializer)
    def get(self, request):
        data = cache.get_or_set(
            SITE_SETTINGS_CACHE_KEY,
            lambda: SiteSettingsSerializer(SiteSettings.load()).data,
            timeout=3600,
        )
        return Response(data)
