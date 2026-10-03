from django.urls import path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("blog/categories", views.BlogCategoryViewSet, basename="blog-category")

urlpatterns = [
    path("faqs/", views.FAQListView.as_view(), name="faq-list"),
    path("testimonials/", views.TestimonialListView.as_view(), name="testimonial-list"),
    path("site-settings/", views.SiteSettingsView.as_view(), name="site-settings"),
    *router.urls,
]
