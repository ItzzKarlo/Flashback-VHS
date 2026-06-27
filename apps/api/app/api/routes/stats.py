from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.auth import UserPublic
from app.services.auth_service import get_current_user
from app.services.stats_service import build_stats


router = APIRouter()


@router.get("")
def statistics(
    range: str = Query(default="7d", pattern="^(24h|3d|7d|30d|all)$"),
    user: UserPublic = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    return build_stats(db, range)

