from django.core.exceptions import ValidationError


def validate_vnd_amount(value: int) -> None:
    """Monetary values must be positive integers (VND, no decimals)."""
    if value <= 0:
        raise ValidationError("Số tiền phải lớn hơn 0.")
    if value % 1000 != 0:
        raise ValidationError("Số tiền phải là bội số của 1.000 VND.")


def validate_phone_number(value: str) -> None:
    import re

    pattern = r"^(\+84|0)[3-9]\d{8}$"
    if not re.match(pattern, value):
        raise ValidationError("Số điện thoại không hợp lệ.")
