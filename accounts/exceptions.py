from rest_framework import status
from rest_framework.exceptions import APIException


class InvalidOTP(APIException):
    # عمداً یک پیام برای همهٔ حالت‌ها (اشتباه، منقضی، مصرف‌شده، بیش از حد تلاش)
    # تا مهاجم نفهمد دقیقاً چرا رد شده است.
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Invalid or expired code."
    default_code = "invalid_otp"
