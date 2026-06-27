from datetime import datetime, timedelta, timezone
from pathlib import Path

from app.core.config import get_settings
from app.core.paths import get_preview_dir, get_temp_dir, get_upload_dir


def _cleanup_folder(folder: Path, cutoff: datetime) -> int:
    removed = 0
    for path in folder.iterdir():
        if path.name == ".gitkeep":
            continue

        modified = datetime.fromtimestamp(path.stat().st_mtime, timezone.utc)
        if modified > cutoff:
            continue

        if path.is_dir():
            for child in path.rglob("*"):
                if child.is_file():
                    removed += 1
            for child in sorted(path.rglob("*"), reverse=True):
                if child.is_file():
                    child.unlink(missing_ok=True)
                elif child.is_dir():
                    child.rmdir()
            path.rmdir()
        else:
            path.unlink(missing_ok=True)
            removed += 1

    return removed


def cleanup_old_temporary_files(max_age_hours: int | None = None) -> dict:
    hours = max_age_hours or get_settings().CLEANUP_MAX_AGE_HOURS
    cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)
    folders = {
        "temp": get_temp_dir(),
        "previews": get_preview_dir(),
        "uploads": get_upload_dir(),
    }
    removed = {name: _cleanup_folder(folder, cutoff) for name, folder in folders.items()}

    return {
        "ok": True,
        "max_age_hours": hours,
        "removed": removed,
        "total_removed": sum(removed.values()),
    }
