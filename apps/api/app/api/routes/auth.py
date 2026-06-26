from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.auth import AuthResponse, LoginRequest, RegisterRequest, UserPublic
from app.services.auth_service import get_current_user, login_user, register_user


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
