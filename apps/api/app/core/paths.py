from pathlib import Path

from app.core.config import get_settings


API_ROOT = Path(__file__).resolve().parents[2]
PROJECT_ROOT = API_ROOT


def resolve_project_path(path: Path | str) -> Path:
    candidate = Path(path)

    if candidate.is_absolute():
        return candidate

    return (API_ROOT / candidate).resolve()


def ensure_dir(path: Path) -> Path:
    path.mkdir(parents=True, exist_ok=True)
    return path


def ensure_storage_dirs() -> None:
    settings = get_settings()

    ensure_dir(resolve_project_path(settings.STORAGE_ROOT))
    ensure_dir(resolve_project_path(settings.UPLOAD_DIR))
    ensure_dir(resolve_project_path(settings.RENDER_DIR))
    ensure_dir(resolve_project_path(settings.PREVIEW_DIR))
    ensure_dir(resolve_project_path(settings.TEMP_DIR))
    ensure_dir(resolve_project_path(settings.USER_DIR))
    ensure_dir(resolve_project_path(settings.ARTWORK_DIR))


def get_upload_dir() -> Path:
    return ensure_dir(resolve_project_path(get_settings().UPLOAD_DIR))


def get_render_dir() -> Path:
    return ensure_dir(resolve_project_path(get_settings().RENDER_DIR))


def get_preview_dir() -> Path:
    return ensure_dir(resolve_project_path(get_settings().PREVIEW_DIR))


def get_temp_dir() -> Path:
    return ensure_dir(resolve_project_path(get_settings().TEMP_DIR))


def get_user_dir() -> Path:
    return ensure_dir(resolve_project_path(get_settings().USER_DIR))


def get_artwork_dir() -> Path:
    return ensure_dir(resolve_project_path(get_settings().ARTWORK_DIR))
