from django.urls import path

from . import views

urlpatterns = [
    path("health/", views.health_check, name="health-check"),
    path("demo-validation/", views.demo_validation, name="demo-validation"),
]
