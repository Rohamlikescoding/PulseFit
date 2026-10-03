# با بالا آمدن Django اپ Celery هم لود می‌شود تا @shared_task به آن وصل شود.
from .celery import app as celery_app

__all__ = ("celery_app",)
