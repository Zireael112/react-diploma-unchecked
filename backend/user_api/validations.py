from rest_framework.exceptions import ValidationError
from django.contrib.auth import get_user_model

UserModel = get_user_model()


def custom_validation(data):
    errors = {}

    email = data["email"].strip()
    username = data["username"].strip()
    password = data["password"].strip()
    ##
    if not email or UserModel.objects.filter(email=email).exists():
        errors["email"] = "choose another email"
    ##
    if not password or len(password) < 6:
        errors["password"] = "choose another password, min 8 characters"
    ##
    if not username:
        errors["username"] = "choose another username"

    if errors:
        raise ValidationError(errors)

    return data


def validate_email(data):
    email = data["email"].strip()
    if not email:
        raise ValidationError("an email is needed")
    return True


def validate_username(data):
    username = data["username"].strip()
    if not username:
        raise ValidationError("choose another username")
    return True


def validate_password(data):
    password = data["password"].strip()
    if not password:
        raise ValidationError("a password is needed")
    return True
