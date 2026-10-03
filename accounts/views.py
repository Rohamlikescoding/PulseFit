from django.contrib.auth.models import update_last_login
from drf_spectacular.utils import extend_schema
from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.settings import api_settings as jwt_settings
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    LogoutSerializer,
    MeSerializer,
    OTPRequestResponseSerializer,
    OTPRequestSerializer,
    OTPVerifySerializer,
    TokenPairResponseSerializer,
)
from .services import otp as otp_service


def get_client_ip(request) -> str | None:
   
    return request.META.get("REMOTE_ADDR")


class OTPRequestView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    @extend_schema(request=OTPRequestSerializer, responses=OTPRequestResponseSerializer)
    def post(self, request):
        serializer = OTPRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        expires_in = otp_service.request_otp(
            serializer.validated_data["phone"],
            ip=get_client_ip(request),
        )
        return Response({"detail": "Code sent.", "expires_in": expires_in})


class OTPVerifyView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    @extend_schema(request=OTPVerifySerializer, responses=TokenPairResponseSerializer)
    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user, created = otp_service.verify_otp(
            serializer.validated_data["phone"],
            serializer.validated_data["code"],
        )
        if not user.is_active:
            raise PermissionDenied("This account is disabled.")

        refresh = RefreshToken.for_user(user)
        if jwt_settings.UPDATE_LAST_LOGIN:
            update_last_login(None, user)

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "is_new_user": created,
            }
        )


class LogoutView(APIView):

    permission_classes = [IsAuthenticated]

    @extend_schema(request=LogoutSerializer, responses={204: None})
    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            token = RefreshToken(serializer.validated_data["refresh"])
        except TokenError:
            raise ValidationError({"refresh": ["Token is invalid or expired."]})

        if str(token.get(jwt_settings.USER_ID_CLAIM)) != str(request.user.pk):
            raise ValidationError({"refresh": ["Token does not belong to this user."]})

        token.blacklist()
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(generics.RetrieveUpdateAPIView):
   

    serializer_class = MeSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "patch", "head", "options"]

    def get_object(self):
        return self.request.user
