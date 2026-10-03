from .base import BaseSMSBackend


outbox: list[dict] = []


class LocMemSMSBackend(BaseSMSBackend):
    def send(self, phone: str, message: str) -> None:
        outbox.append({"phone": phone, "message": message})

    def send_otp(self, phone: str, code: str) -> None:
        outbox.append({"phone": phone, "message": f"کد ورود شما: {code}", "code": code})
