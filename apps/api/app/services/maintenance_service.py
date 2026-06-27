from app.core.config import get_settings
from app.core.paths import get_storage_dir
from app.services.file_service import read_json, write_json


def _maintenance_path():
    return get_storage_dir() / "maintenance.json"


def get_maintenance_status() -> dict:
    settings = get_settings()
    path = _maintenance_path()

    if path.exists():
        try:
            stored = read_json(path)
            return {
                "enabled": bool(stored.get("enabled")),
                "message": stored.get("message") or settings.MAINTENANCE_MESSAGE,
            }
        except (OSError, ValueError):
            pass

    return {
        "enabled": settings.MAINTENANCE_MODE,
        "message": settings.MAINTENANCE_MESSAGE,
    }


def set_maintenance_status(enabled: bool, message: str | None = None) -> dict:
    settings = get_settings()
    status = {
        "enabled": enabled,
        "message": (message or settings.MAINTENANCE_MESSAGE).strip(),
    }
    write_json(_maintenance_path(), status)
    return status


def maintenance_enabled() -> bool:
    return bool(get_maintenance_status()["enabled"])
