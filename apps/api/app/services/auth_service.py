import hashlib
import secrets
from datetime import datetime, timedelta

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import (
    is_expired,
    new_session_token,
    password_hash,
    session_expires_at,
    utc_now,
    verify_password,
)
from app.db.database import get_db
from app.models.artwork import Artwork
from app.models.user import PasswordResetToken, User, UserSession
from app.schemas.auth import (
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
from app.utils.ids import new_id


bearer_scheme = HTTPBearer(auto_error=False)


def _iso(value: datetime | str) -> str:
    if isinstance(value, datetime):
        return value.isoformat()

    return value


def _public_user(user: User) -> UserPublic:
    return UserPublic(
        user_id=user.user_id,
        username=user.username,
        email=user.email,
        is_admin=bool(user.is_admin),
        created_at=_iso(user.created_at),
    )


def _auth_response(user: User, token: str, expires_at: str) -> AuthResponse:
    return AuthResponse(
        token=token,
        expires_at=expires_at,
        user=_public_user(user),
    )


def register_user(request: RegisterRequest, db: Session) -> AuthResponse:
    email = request.email.lower()
    existing = db.scalar(select(User).where(User.email == email))

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    user = User(
        user_id=new_id("user"),
        username=request.username.strip(),
        email=email,
        password_hash=password_hash(request.password),
        is_admin=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return create_session(user, db)


def create_admin_user(request: RegisterRequest, db: Session) -> AuthResponse:
    existing_admin = db.scalar(select(User).where(User.is_admin == True))
    if existing_admin:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An admin account already exists.",
        )

    email = request.email.lower()
    existing_email = db.scalar(select(User).where(User.email == email))
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    user = User(
        user_id=new_id("user"),
        username=request.username.strip(),
        email=email,
        password_hash=password_hash(request.password),
        is_admin=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return create_session(user, db)


def login_user(request: LoginRequest, db: Session) -> AuthResponse:
    user = db.scalar(select(User).where(User.email == request.email.lower()))

    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    return create_session(user, db)


def create_session(user: User, db: Session) -> AuthResponse:
    token = new_session_token()
    expires_at = session_expires_at()
    session = UserSession(
        token=token,
        user_id=user.user_id,
        expires_at=datetime.fromisoformat(expires_at),
    )
    db.add(session)
    db.commit()
    return _auth_response(user, token, expires_at)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> UserPublic:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token.",
        )

    session = db.scalar(
        select(UserSession).where(UserSession.token == credentials.credentials)
    )

    if not session or is_expired(_iso(session.expires_at)):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired. Please log in again.",
        )

    user = db.scalar(select(User).where(User.user_id == session.user_id))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account no longer exists.",
        )

    return _public_user(user)


def get_current_user_model(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    public_user = get_current_user(credentials, db)
    user = db.scalar(select(User).where(User.user_id == public_user.user_id))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account no longer exists.",
        )

    return user


def require_admin(user: UserPublic = Depends(get_current_user)) -> UserPublic:
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required.",
        )

    return user


def change_password(request: ChangePasswordRequest, user: User, db: Session) -> dict:
    if not verify_password(request.current_password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect.",
        )

    user.password_hash = password_hash(request.new_password)
    db.query(UserSession).filter(UserSession.user_id == user.user_id).delete()
    db.commit()
    return {"ok": True, "message": "Password changed. Please log in again."}


def delete_account(request: DeleteAccountRequest, user: User, db: Session) -> dict:
    if not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password is incorrect.",
        )

    db.query(Artwork).filter(Artwork.user_id == user.user_id).delete()
    db.query(UserSession).filter(UserSession.user_id == user.user_id).delete()
    db.query(PasswordResetToken).filter(PasswordResetToken.user_id == user.user_id).delete()
    db.delete(user)
    db.commit()
    return {"ok": True, "message": "Account deleted."}


def _reset_token_hash(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def forgot_password(request: ForgotPasswordRequest, db: Session) -> ForgotPasswordResponse:
    user = db.scalar(select(User).where(User.email == request.email.lower()))
    message = "If that email exists, a password reset token has been created."

    if not user:
        return ForgotPasswordResponse(message=message)

    token = secrets.token_urlsafe(32)
    expires_at = utc_now() + timedelta(minutes=30)
    db.query(PasswordResetToken).filter(PasswordResetToken.user_id == user.user_id).delete()
    db.add(
        PasswordResetToken(
            token_hash=_reset_token_hash(token),
            user_id=user.user_id,
            expires_at=expires_at,
        )
    )
    db.commit()
    return ForgotPasswordResponse(
        message=message,
        reset_token=token,
        expires_at=expires_at.isoformat(),
    )


def reset_password(request: ResetPasswordRequest, db: Session) -> dict:
    token = db.get(PasswordResetToken, _reset_token_hash(request.token))
    if not token or is_expired(_iso(token.expires_at)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset token is invalid or expired.",
        )

    user = db.scalar(select(User).where(User.user_id == token.user_id))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset token is no longer valid.",
        )

    user.password_hash = password_hash(request.new_password)
    db.delete(token)
    db.query(UserSession).filter(UserSession.user_id == user.user_id).delete()
    db.commit()
    return {"ok": True, "message": "Password reset. You can log in with the new password."}
