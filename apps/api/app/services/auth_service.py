from datetime import datetime

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import (
    is_expired,
    new_session_token,
    password_hash,
    session_expires_at,
    verify_password,
)
from app.db.database import get_db
from app.models.user import User, UserSession
from app.schemas.auth import AuthResponse, LoginRequest, RegisterRequest, UserPublic
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
