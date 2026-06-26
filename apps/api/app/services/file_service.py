import json
import shutil
from pathlib import Path

from fastapi import HTTPException, UploadFile, status

from app.core.config import get_settings
from app.core.paths import get_preview_dir, get_render_dir, get_upload_dir
from app.utils.ids import new_id
from app.utils.mime import detect_media_kind, is_allowed_upload, normalize_extension


def _json_path(base_dir: Path, item_id: str) -> Path:
    return base_dir / f"{item_id}.json"


def write_json(path: Path, data: dict) -> None:
    path.write_text(json.dumps(data, indent=2), encoding="utf-8")


def read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def save_upload_file(file: UploadFile) -> dict:
    settings = get_settings()

    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing filename.",
        )

    if not is_allowed_upload(file.filename):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Unsupported file type. Try mp4, mov, webm, gif, jpg, jpeg, png, or webp.",
        )

    upload_dir = get_upload_dir()
    file_id = new_id("upload")
    extension = normalize_extension(file.filename)
    stored_filename = f"{file_id}{extension}"
    stored_path = upload_dir / stored_filename

    size = 0
    max_bytes = settings.max_upload_bytes

    with stored_path.open("wb") as buffer:
        while True:
            chunk = file.file.read(1024 * 1024)
            if not chunk:
                break

            size += len(chunk)
            if size > max_bytes:
                buffer.close()
                stored_path.unlink(missing_ok=True)
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"Upload too large. Max upload is {settings.MAX_UPLOAD_MB} MB.",
                )

            buffer.write(chunk)

    media_kind = detect_media_kind(file.filename)

    metadata = {
        "file_id": file_id,
        "original_filename": file.filename,
        "stored_filename": stored_filename,
        "stored_path": str(stored_path),
        "media_kind": media_kind,
        "extension": extension,
        "content_type": file.content_type,
        "size_bytes": size,
    }

    write_json(_json_path(upload_dir, file_id), metadata)
    return metadata


def get_upload_metadata(file_id: str) -> dict:
    metadata_path = _json_path(get_upload_dir(), file_id)

    if not metadata_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Uploaded file not found.",
        )

    metadata = read_json(metadata_path)
    stored_path = Path(metadata["stored_path"])

    if not stored_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Uploaded file exists in metadata but the actual file is missing.",
        )

    return metadata


def get_upload_path(file_id: str) -> Path:
    return Path(get_upload_metadata(file_id)["stored_path"])


def save_preview_metadata(preview_id: str, metadata: dict) -> None:
    write_json(_json_path(get_preview_dir(), preview_id), metadata)


def get_preview_metadata(preview_id: str) -> dict:
    metadata_path = _json_path(get_preview_dir(), preview_id)

    if not metadata_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Preview not found.",
        )

    return read_json(metadata_path)


def get_preview_path(preview_id: str) -> Path:
    metadata = get_preview_metadata(preview_id)
    output_path = Path(metadata.get("output_path", ""))

    if not output_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Preview image is missing.",
        )

    return output_path


def save_render_metadata(job_id: str, metadata: dict) -> None:
    write_json(_json_path(get_render_dir(), job_id), metadata)


def get_render_metadata(job_id: str) -> dict:
    metadata_path = _json_path(get_render_dir(), job_id)

    if not metadata_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Render job not found.",
        )

    return read_json(metadata_path)


def get_render_path(job_id: str) -> Path:
    metadata = get_render_metadata(job_id)
    output_path = Path(metadata.get("output_path", ""))

    if not output_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rendered file is missing.",
        )

    return output_path


def clear_storage_folder(folder: Path) -> None:
    for path in folder.iterdir():
        if path.name == ".gitkeep":
            continue

        if path.is_dir():
            shutil.rmtree(path)
        else:
            path.unlink(missing_ok=True)
