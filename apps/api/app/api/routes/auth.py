from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.database import get_db
from app.models.user import User
from app.schemas.auth import (
    AdminBootstrapRequest,
    AuthResponse,
    ChangePasswordRequest,
    DeleteAccountRequest,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    LoginRequest,
    RegisterRequest,
    ResetPasswordRequest,
    UserPublic,
)
from app.services.auth_service import (
    change_password,
    create_admin_user,
    delete_account,
    forgot_password,
    get_current_user,
    get_current_user_model,
    login_user,
    register_user,
    reset_password,
)


router = APIRouter()


@router.post("/register", response_model=AuthResponse)
def register(request: RegisterRequest, db: Session = Depends(get_db)) -> AuthResponse:
    return register_user(request, db)


@router.post("/login", response_model=AuthResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)) -> AuthResponse:
    return login_user(request, db)


@router.get("/me", response_model=UserPublic)
def me(user: UserPublic = Depends(get_current_user)) -> UserPublic:
    return user


@router.post("/change-password")
def update_password(
    request: ChangePasswordRequest,
    user: User = Depends(get_current_user_model),
    db: Session = Depends(get_db),
) -> dict:
    return change_password(request, user, db)


@router.delete("/me")
def remove_account(
    request: DeleteAccountRequest,
    user: User = Depends(get_current_user_model),
    db: Session = Depends(get_db),
) -> dict:
    return delete_account(request, user, db)


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
def request_password_reset(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db),
) -> ForgotPasswordResponse:
    return forgot_password(request, db)


@router.post("/reset-password")
def complete_password_reset(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db),
) -> dict:
    return reset_password(request, db)


@router.post("/admin/bootstrap", response_model=AuthResponse)
def bootstrap_admin(
    request: AdminBootstrapRequest,
    x_admin_setup_key: str = Header(default=""),
    db: Session = Depends(get_db),
) -> AuthResponse:
    setup_key = get_settings().ADMIN_SETUP_KEY

    if not setup_key or x_admin_setup_key != setup_key:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid admin setup key.",
        )

    return create_admin_user(request, db)
