import pytest
from django.contrib import admin
from django.urls import reverse

pytestmark = pytest.mark.django_db


@pytest.mark.parametrize(
    "model",
    list(admin.site._registry),
    ids=lambda m: f"{m._meta.app_label}.{m._meta.model_name}",
)
def test_admin_changelist_and_add_pages_render(client, admin_user, model):
    client.force_login(admin_user)
    opts = model._meta
    changelist = reverse(f"admin:{opts.app_label}_{opts.model_name}_changelist")
    assert client.get(changelist).status_code == 200

    add = reverse(f"admin:{opts.app_label}_{opts.model_name}_add")
    # 403 is fine for models where adding through admin is disabled on purpose.
    assert client.get(add).status_code in (200, 403)
