from django.db import models


class TimeStampedModel(models.Model):
    """مدل پایه: زمان ساخت و آخرین ویرایش را به هر مدلی که از آن ارث ببرد اضافه می‌کند."""

    created_at = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
        verbose_name="Created At",
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Updated At",
    )

    class Meta:
        abstract = True
