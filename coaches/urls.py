from django.urls import path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("coaches", views.CoachViewSet, basename="coach")

urlpatterns = [
    path("specialties/", views.SpecialtyListView.as_view(), name="specialty-list"),
    *router.urls,
]
