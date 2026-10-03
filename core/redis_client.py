import redis
from django.conf import settings

# اتصال واقعی تا اولین دستور برقرار نمی‌شود، پس import این ماژول
# حتی وقتی Redis خاموش است خطا نمی‌دهد.
redis_client = redis.Redis.from_url(
    settings.REDIS_URL,
    decode_responses=True,
    socket_connect_timeout=3,
    socket_timeout=3,
    health_check_interval=30,
)
