from celery import shared_task

from .sms import SMSError, get_sms_backend


@shared_task(
    autoretry_for=(SMSError,),
    retry_backoff=True,      # فاصلهٔ تلاش‌ها: 1، 2، 4 ثانیه...
    max_retries=3,
)
def send_otp_sms(phone: str, code: str) -> None:
    get_sms_backend().send_otp(phone, code)
