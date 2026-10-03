import logging

from .base import BaseSMSBackend

logger = logging.getLogger("sms")


class ConsoleSMSBackend(BaseSMSBackend):
    

    def send(self, phone: str, message: str) -> None:
        logger.info("[ConsoleSMS] to=%s message=%s", phone, message)
