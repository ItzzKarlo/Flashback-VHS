from pathlib import Path

from app.core.config import get_settings
from app.core.paths import resolve_project_path
from app.schemas.render import TimestampConfig


def build_timestamp_text(config: TimestampConfig) -> str:
    if config.label:
        return config.label.strip()

    return f"{config.date.strip()} {config.time.strip()}".strip()


def escape_drawtext_text(value: str) -> str:
    # FFmpeg drawtext uses :, ',', %, \\ and quotes as special chars.
    return (
        value.replace("\\", "\\\\")
        .replace(":", "\\:")
        .replace("'", r"\'")
        .replace(",", "\\,")
        .replace("%", "\\%")
        .replace("[", r"\[")
        .replace("]", r"\]")
    )


def escape_drawtext_path(path: Path) -> str:
    # FFmpeg filter paths are safest with forward slashes and an escaped Windows drive colon.
    value = str(path).replace("\\", "/")
    value = value.replace(":", r"\:", 1)
    value = value.replace("'", r"\'")
    return value


def drawtext_font_option() -> str:
    configured = get_settings().FFMPEG_FONT_FILE.strip()
    if not configured:
        return ""

    font_path = resolve_project_path(configured)
    if not font_path.exists():
        # Let FFmpeg try its own default font discovery.
        return ""

    return f"fontfile='{escape_drawtext_path(font_path)}':"


def drawtext_xy(position: str) -> tuple[str, str]:
    margin = "38"

    positions = {
        "top_left": (margin, margin),
        "top_right": (f"w-tw-{margin}", margin),
        "bottom_left": (margin, f"h-th-{margin}"),
        "bottom_right": (f"w-tw-{margin}", f"h-th-{margin}"),
    }

    return positions.get(position, positions["bottom_left"])
