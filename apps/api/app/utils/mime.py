from pathlib import Path
from typing import Literal


MediaKind = Literal["image", "video", "animation"]

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff"}
ANIMATION_EXTENSIONS = {".gif"}
VIDEO_EXTENSIONS = {".mp4", ".mov", ".m4v", ".webm", ".mkv", ".avi"}
ALLOWED_EXTENSIONS = IMAGE_EXTENSIONS | ANIMATION_EXTENSIONS | VIDEO_EXTENSIONS

OUTPUT_IMAGE_FORMATS = {"jpg", "jpeg", "png", "webp"}
OUTPUT_VIDEO_FORMATS = {"mp4", "webm", "gif"}
OUTPUT_FORMATS = OUTPUT_IMAGE_FORMATS | OUTPUT_VIDEO_FORMATS


def normalize_extension(filename: str) -> str:
    return Path(filename).suffix.lower().strip()


def is_allowed_upload(filename: str) -> bool:
    return normalize_extension(filename) in ALLOWED_EXTENSIONS


def detect_media_kind(filename: str) -> MediaKind:
    ext = normalize_extension(filename)

    if ext in IMAGE_EXTENSIONS:
        return "image"

    if ext in ANIMATION_EXTENSIONS:
        return "animation"

    if ext in VIDEO_EXTENSIONS:
        return "video"

    raise ValueError(f"Unsupported file extension: {ext or '[none]'}")


def output_is_image(output_format: str) -> bool:
    return output_format.lower() in OUTPUT_IMAGE_FORMATS


def output_is_video(output_format: str) -> bool:
    return output_format.lower() in OUTPUT_VIDEO_FORMATS
