import pytest
from django.core.exceptions import ValidationError
from django.db import IntegrityError

pytestmark = pytest.mark.django_db


def test_create_user_normalizes_phone_and_has_unusable_password(django_user_model):
    user = django_user_model.objects.create_user(phone="+989121234567")
    assert user.phone == "09121234567"
    assert user.role == django_user_model.Role.ATHLETE
    assert not user.has_usable_password()
    assert not user.is_staff


def test_create_user_with_password(django_user_model):
    user = django_user_model.objects.create_user(phone="09121234567", password="Str0ng-pass!")
    assert user.check_password("Str0ng-pass!")


def test_create_user_rejects_invalid_phone(django_user_model):
    with pytest.raises(ValueError):
        django_user_model.objects.create_user(phone="12345")


def test_phone_is_unique_after_normalization(django_user_model):
    django_user_model.objects.create_user(phone="09121234567")
    with pytest.raises(IntegrityError):
        django_user_model.objects.create_user(phone="+98 912 123 4567")


def test_create_superuser(django_user_model):
    admin = django_user_model.objects.create_superuser(phone="09121234567", password="Str0ng-pass!")
    assert admin.is_staff and admin.is_superuser and admin.is_active
    assert admin.role == django_user_model.Role.ADMIN


def test_create_superuser_requires_is_staff(django_user_model):
    with pytest.raises(ValueError):
        django_user_model.objects.create_superuser(
            phone="09121234567", password="x", is_staff=False
        )


def test_model_clean_normalizes_phone(django_user_model):
    user = django_user_model(phone="۰۹۱۲۱۲۳۴۵۶۷")
    user.clean()
    assert user.phone == "09121234567"


def test_model_clean_rejects_invalid_phone(django_user_model):
    with pytest.raises(ValidationError):
        django_user_model(phone="abc").clean()


def test_createsuperuser_command(django_user_model):
    from django.core.management import call_command

    call_command("createsuperuser", phone="+989121234567", interactive=False, verbosity=0)
    assert django_user_model.objects.get(phone="09121234567").is_superuser


def test_admin_add_user_normalizes_phone(client, admin_user, django_user_model):
    client.force_login(admin_user)
    response = client.post(
        "/admin/accounts/user/add/",
        {
            "phone": "+989351112233",
            "password1": "Str0ng-pass!",
            "password2": "Str0ng-pass!",
            "role": "COACH",
            "is_active": "on",
            "athlete_profile-TOTAL_FORMS": "0",
            "athlete_profile-INITIAL_FORMS": "0",
        },
    )
    assert response.status_code == 302, response.content[:2000]
    assert django_user_model.objects.filter(phone="09351112233").exists()


def test_admin_pages_render(client, admin_user):
    client.force_login(admin_user)
    for url in ["/admin/accounts/user/", "/admin/accounts/user/add/", "/admin/accounts/otpcode/"]:
        assert client.get(url).status_code == 200, url
