class SMSError(Exception):
    pass


class BaseSMSBackend:
    def send(self, phone: str, message: str) -> None:
        raise NotImplementedError

    def send_otp(self, phone: str, code: str) -> None:
       
        self.send(phone, f"کد ورود شما: {code}")
