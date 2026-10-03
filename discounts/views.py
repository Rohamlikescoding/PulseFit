from drf_spectacular.utils import extend_schema
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import DiscountResultSerializer, DiscountValidateSerializer
from .services import calculate_discount, find_discount


class DiscountValidateView(APIView):
    """
    P3-10: returns what the price would be. Read-only by design: it never
    increments used_count or creates a DiscountUsage (that happens on payment).
    """

    permission_classes = [IsAuthenticated]  # per-user limits need the user

    @extend_schema(request=DiscountValidateSerializer, responses=DiscountResultSerializer)
    def post(self, request):
        serializer = DiscountValidateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        discount = find_discount(serializer.validated_data["code"])
        result = calculate_discount(discount, serializer.validated_data["plan"], request.user)
        return Response(
            {
                "code": discount.code,
                "subtotal": result.subtotal,
                "discount_amount": result.discount_amount,
                "total": result.total,
            }
        )
