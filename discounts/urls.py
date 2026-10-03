from django.urls import path

from . import views

urlpatterns = [
    path("discounts/validate/", views.DiscountValidateView.as_view(), name="discount-validate"),
]
