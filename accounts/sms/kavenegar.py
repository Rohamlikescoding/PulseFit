import requests
from django.conf import settings

from .base import BaseSMSBackend, SMSError

API_BASE = "https://api.kavenegar.com/v1"


class KavenegarSMSBackend(BaseSMSBackend):


    timeout = 10

    def __init__(self):
        self.api_key = settings.KAVENEGAR_API_KEY
        if not self.api_key:
            raise SMSError("KAVENEGAR_API_KEY is not set.")

    def _call(self, method: str, params: dict) -> dict:
        url = f"{API_BASE}/{self.api_key}/{method}.json"
        try:
            response = requests.post(url, data=params, timeout=self.timeout)
            body = response.json()
        except (requests.RequestException, ValueError) as exc:
            raise SMSError(f"Kavenegar request failed: {exc}") from exc

        status = body.get("return", {}).get("status")
        if status != 200:
            raise SMSError(f"Kavenegar error {status}: {body.get('return', {}).get('message')}")
        return body

    def send(self, phone: str, message: str) -> None:
        self._call("sms/send", {"receptor": phone, "message": message})

    def send_otp(self, phone: str, code: str) -> None:
        self._call(
            "verify/lookup",
            {"receptor": phone, "token": code, "template": settings.KAVENEGAR_OTP_TEMPLATE},
        )
