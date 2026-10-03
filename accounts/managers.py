from django.contrib.auth.models import BaseUserManager

from core.utils import normalize_phone


class UserManager(BaseUserManager):
    def create_user(self, phone, password=None, **extra_fields):
        if not phone:
            raise ValueError("شماره تلفن الزامی است.")
        phone = normalize_phone(phone)

        user = self.model(phone=phone, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()

        user.save(using=self._db)
        return user

    def create_superuser(self, phone, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", self.model.Role.ADMIN)
        extra_fields.setdefault("is_active", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("سوپریوزر باید is_staff=True داشته باشد.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("سوپریوزر باید is_superuser=True داشته باشد.")

        return self.create_user(phone, password, **extra_fields)
