from collections import Counter
from datetime import datetime, timedelta, timezone
from statistics import mean

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.paths import get_render_dir
from app.models.artwork import Artwork
from app.models.user import User
from app.services.file_service import read_json


RANGES = {
    "24h": timedelta(hours=24),
    "3d": timedelta(days=3),
    "7d": timedelta(days=7),
    "30d": timedelta(days=30),
    "all": None,
}


def _parse_datetime(value: str | None) -> datetime | None:
    if not value:
        return None

    try:
        parsed = datetime.fromisoformat(value)
    except ValueError:
        return None

    if parsed.tzinfo is None:
        return parsed.replace(tzinfo=timezone.utc)

    return parsed


def _iso_datetime(value: datetime | str) -> str:
    if isinstance(value, datetime):
        return value.isoformat()

    return value


def _render_metadata() -> list[dict]:
    renders = []
    for path in get_render_dir().glob("render_*.json"):
        try:
            item = read_json(path)
        except (OSError, ValueError):
            continue

        if item.get("status") == "done":
            renders.append(item)

    return renders


def _within_range(item: dict, range_key: str, now: datetime) -> bool:
    delta = RANGES.get(range_key)
    if delta is None:
        return True

    created_at = _parse_datetime(item.get("created_at"))
    if not created_at:
        return False

    return created_at >= now - delta


def build_stats(db: Session, range_key: str = "7d") -> dict:
    now = datetime.now(timezone.utc)
    selected_range = range_key if range_key in RANGES else "7d"
    renders = _render_metadata()
    filtered = [item for item in renders if _within_range(item, selected_range, now)]
    durations = [
        float(item["render_duration_seconds"])
        for item in filtered
        if isinstance(item.get("render_duration_seconds"), int | float)
    ]
    preset_counts = Counter(item.get("preset", "unknown") for item in filtered)
    format_counts = Counter(item.get("output_format", "unknown") for item in filtered)
    media_counts = Counter(item.get("media_kind", "unknown") for item in filtered)

    period_counts = {
        key: sum(1 for item in renders if _within_range(item, key, now))
        for key in ["24h", "3d", "7d", "30d", "all"]
    }

    return {
        "range": selected_range,
        "generated": {
            "all_time": len(renders),
            "last_24h": period_counts["24h"],
            "last_3d": period_counts["3d"],
            "last_7d": period_counts["7d"],
            "last_30d": period_counts["30d"],
            "selected": len(filtered),
        },
        "average_render_time_seconds": round(mean(durations), 2) if durations else None,
        "most_used_presets": preset_counts.most_common(8),
        "output_formats": format_counts.most_common(),
        "media_kinds": media_counts.most_common(),
        "users": {
            "total": db.scalar(select(func.count()).select_from(User)) or 0,
            "admins": db.scalar(select(func.count()).select_from(User).where(User.is_admin == True)) or 0,
        },
        "saved_artworks": db.scalar(select(func.count()).select_from(Artwork)) or 0,
    }


def list_admin_users(db: Session) -> list[dict]:
    users = db.scalars(select(User).order_by(User.created_at.desc())).all()
    return [
        {
            "user_id": user.user_id,
            "username": user.username,
            "email": user.email,
            "is_admin": bool(user.is_admin),
            "created_at": _iso_datetime(user.created_at),
        }
        for user in users
    ]
