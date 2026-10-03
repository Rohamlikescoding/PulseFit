import logging

from django.db import connection
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .constants import API_VERSION
from .redis_client import redis_client
from .serializers import DemoSerializer

logger = logging.getLogger(__name__)


def _check_database() -> bool:
    try:
        connection.ensure_connection()
        return True
    except Exception:
        logger.exception("Health check: database unavailable")
        return False


def _check_redis() -> bool:
    try:
        return bool(redis_client.ping())
    except Exception:
        logger.exception("Health check: redis unavailable")
        return False


@extend_schema(
    responses=inline_serializer(
        name="HealthCheck",
        fields={
            "status": serializers.CharField(),
            "message": serializers.CharField(),
            "version": serializers.CharField(),
            "services": serializers.DictField(child=serializers.CharField()),
        },
    ),
)
@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    services = {
        "database": "ok" if _check_database() else "down",
        "redis": "ok" if _check_redis() else "down",
    }
    healthy = all(state == "ok" for state in services.values())

    return Response(
        {
            "status": "ok" if healthy else "degraded",
            "message": "Coach API is running",
            "version": API_VERSION,
            "services": services,
        },
        status=status.HTTP_200_OK if healthy else status.HTTP_503_SERVICE_UNAVAILABLE,
    )


@extend_schema(request=DemoSerializer, responses=DemoSerializer)
@api_view(["POST"])
@permission_classes([AllowAny])
def demo_validation(request):
    serializer = DemoSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    return Response(
        serializer.validated_data,
        status=status.HTTP_200_OK,
    )
