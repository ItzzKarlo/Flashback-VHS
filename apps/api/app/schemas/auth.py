from pydantic import BaseModel, Field, field_validator


class UserPublic(BaseModel):
    user_id: str
    username: str
    email: str
    is_admin: bool = False
    created_at: str


class RegisterRequest(BaseModel):
    username: str = Field(min_length=2, max_length=40)
    email: str
    password: str = Field(min_length=8, max_length=128)

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        normalized = value.strip().lower()
        if "@" not in normalized or "." not in normalized.rsplit("@", maxsplit=1)[-1]:
            raise ValueError("Enter a valid email address.")
        return normalized


class LoginRequest(BaseModel):
    email: str
    password: str = Field(min_length=1, max_length=128)

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        normalized = value.strip().lower()
        if "@" not in normalized:
            raise ValueError("Enter a valid email address.")
        return normalized


class AuthResponse(BaseModel):
    token: str
    token_type: str = "bearer"
    expires_at: str
    user: UserPublic


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=1, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)


class DeleteAccountRequest(BaseModel):
    password: str = Field(min_length=1, max_length=128)


class ForgotPasswordRequest(BaseModel):
    email: str

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        normalized = value.strip().lower()
        if "@" not in normalized:
            raise ValueError("Enter a valid email address.")
        return normalized


class ForgotPasswordResponse(BaseModel):
    message: str
    reset_token: str | None = None
    expires_at: str | None = None


class ResetPasswordRequest(BaseModel):
    token: str = Field(min_length=16, max_length=200)
    new_password: str = Field(min_length=8, max_length=128)


class AdminBootstrapRequest(RegisterRequest):
    pass
