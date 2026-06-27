from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.auth import UserPublic
from app.services.auth_service import require_admin
from app.services.stats_service import build_stats, list_admin_users
from app.utils.cleanup import cleanup_old_temporary_files


router = APIRouter()


@router.get("/summary")
def admin_summary(
    admin: UserPublic = Depends(require_admin),
    db: Session = Depends(get_db),
) -> dict:
    return {
        "stats": build_stats(db, "7d"),
        "users": list_admin_users(db),
    }


@router.post("/cleanup")
def run_cleanup(admin: UserPublic = Depends(require_admin)) -> dict:
    return cleanup_old_temporary_files()
