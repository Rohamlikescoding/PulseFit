from drf_spectacular.utils import extend_schema
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.permissions import IsAthlete
from coaches.serializers import PublicReviewSerializer, ReviewCreateSerializer
from coaches.services import create_review

from . import services
from .models import Order
from .serializers import (
    OrderCreateSerializer,
    OrderDetailSerializer,
    OrderListSerializer,
    RevisionRequestSerializer,
)


class OrderViewSet(mixins.CreateModelMixin, viewsets.ReadOnlyModelViewSet):
    """
    /orders/ for the logged-in athlete. Every lookup goes through get_queryset(),
    which is filtered by owner, so someone else's order is a 404 (not 403:
    a 403 would confirm that the order number exists).
    """

    permission_classes = [IsAuthenticated, IsAthlete]
    lookup_field = "number"
    lookup_value_regex = r"[A-Z0-9-]+"

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):  # schema generation has no user
            return Order.objects.none()
        qs = Order.objects.filter(user=self.request.user).select_related("coach", "renewed_from")
        if self.action == "retrieve":
            qs = qs.prefetch_related("status_logs", "revision_requests")
        return qs

    def get_serializer_class(self):
        if self.action == "list":
            return OrderListSerializer
        if self.action == "create":
            return OrderCreateSerializer
        return OrderDetailSerializer

    @extend_schema(request=OrderCreateSerializer, responses={201: OrderDetailSerializer})
    def create(self, request, *args, **kwargs):
        serializer = OrderCreateSerializer(data=request.data, context=self.get_serializer_context())
        serializer.is_valid(raise_exception=True)
        order = services.create_order(user=request.user, **serializer.validated_data)
        return Response(OrderDetailSerializer(order).data, status=status.HTTP_201_CREATED)

    @extend_schema(request=None, responses=OrderDetailSerializer)
    @action(detail=True, methods=["post"])
    def cancel(self, request, number=None):
        order = services.cancel_order(self.get_object(), actor=request.user)
        return Response(OrderDetailSerializer(order).data)

    @extend_schema(request=ReviewCreateSerializer, responses={201: PublicReviewSerializer})
    @action(detail=True, methods=["post"])
    def review(self, request, number=None):
        serializer = ReviewCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        review = create_review(order=self.get_object(), user=request.user, **serializer.validated_data)
        return Response(PublicReviewSerializer(review).data, status=status.HTTP_201_CREATED)

    @extend_schema(request=RevisionRequestSerializer, responses={201: RevisionRequestSerializer})
    @action(detail=True, methods=["post"])
    def revisions(self, request, number=None):
        serializer = RevisionRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        revision = services.request_revision(
            self.get_object(), user=request.user, note=serializer.validated_data["note"]
        )
        return Response(RevisionRequestSerializer(revision).data, status=status.HTTP_201_CREATED)
