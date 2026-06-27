from fastapi import HTTPException, status

from app.core.paths import get_preview_dir
from app.render.filter_builder import build_vhs_filter
from app.schemas.render import PreviewResponse, RenderRequest
from app.services.ffmpeg_service import run_ffmpeg
from app.services.file_service import (
    get_upload_metadata,
    get_upload_path,
    save_preview_metadata,
)
from app.services.preset_service import effects_for_request, overlay_for_request
from app.utils.ids import new_id


def _compact_ffmpeg_error(stderr: str) -> str:
    lines = [line.strip() for line in stderr.splitlines() if line.strip()]
    if not lines:
        return "FFmpeg failed without an error message."

    return "\n".join(lines[-16:])


def create_preview(request: RenderRequest) -> PreviewResponse:
    input_metadata = get_upload_metadata(request.input_id)
    input_path = get_upload_path(request.input_id)
    input_media_kind = input_metadata["media_kind"]

    preview_request = request.model_copy(deep=True)
    preview_request.output.format = "jpg"

    effects = effects_for_request(preview_request.preset, preview_request.effects)
    overlay_mode = overlay_for_request(preview_request.preset, preview_request.overlay_mode)
    filter_chain = build_vhs_filter(
        preview_request,
        effects,
        overlay_mode=overlay_mode,
        input_media_kind=input_media_kind,
    )

    preview_id = new_id("preview")
    output_filename = f"{preview_id}.jpg"
    output_path = get_preview_dir() / output_filename

    args = [
        "-y",
        "-i",
        str(input_path),
        "-vf",
        filter_chain,
        "-frames:v",
        "1",
        str(output_path),
    ]

    result = run_ffmpeg(args, timeout=60)

    base_metadata = {
        "preview_id": preview_id,
        "input_id": request.input_id,
        "preset": request.preset,
        "overlay_mode": overlay_mode,
        "output_format": "jpg",
        "output_filename": output_filename,
        "output_path": str(output_path),
        "media_kind": input_media_kind,
        "preview_url": f"/api/preview/{preview_id}/download",
        "request": preview_request.model_dump(),
        "ffmpeg_args": args,
    }

    if result.returncode != 0:
        error = _compact_ffmpeg_error(result.stderr)
        metadata = {
            **base_metadata,
            "status": "error",
            "error": error,
        }
        save_preview_metadata(preview_id, metadata)

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "message": "Preview failed.",
                "preview_id": preview_id,
                "error": error,
            },
        )

    metadata = {
        **base_metadata,
        "status": "done",
        "error": None,
    }
    save_preview_metadata(preview_id, metadata)

    return PreviewResponse(**metadata)
