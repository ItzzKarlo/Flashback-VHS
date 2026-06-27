from fastapi import APIRouter

from app.core.config import get_settings
from app.core.paths import get_preview_dir, get_render_dir, get_temp_dir, get_upload_dir
from app.services.ffmpeg_service import check_ffmpeg, check_ffprobe


router = APIRouter()


@router.get("")
def health_check() -> dict:
    settings = get_settings()

    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "environment": settings.APP_ENV,
    }


@router.get("/ffmpeg")
def ffmpeg_health_check() -> dict:
    ffmpeg = check_ffmpeg()
    ffprobe = check_ffprobe()

    return {
        "status": "ok" if ffmpeg["available"] and ffprobe["available"] else "error",
        "ffmpeg": ffmpeg,
        "ffprobe": ffprobe,
    }


@router.get("/storage")
def storage_health_check() -> dict:
    return {
        "status": "ok",
        "uploads": str(get_upload_dir()),
        "renders": str(get_render_dir()),
        "previews": str(get_preview_dir()),
        "temp": str(get_temp_dir()),
    }
