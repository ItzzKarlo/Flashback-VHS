import re

from fastapi import HTTPException, status

from app.core.paths import get_render_dir
from app.render.filter_builder import build_vhs_filter
from app.schemas.render import RenderJobResponse, RenderRequest
from app.services.ffmpeg_service import run_ffmpeg
from app.services.file_service import (
    get_upload_metadata,
    get_upload_path,
    save_render_metadata,
)
from app.services.preset_service import effects_for_request, overlay_for_request
from app.utils.ids import new_id
from app.utils.mime import output_is_image


IMAGE_TO_VIDEO_SECONDS = 4
DEFAULT_IMAGE_OUTPUT_FORMAT = "jpg"
DEFAULT_VIDEO_OUTPUT_FORMAT = "mp4"


def _video_codec_args(output_format: str, crf: int) -> list[str]:
    if output_format == "webm":
        return ["-c:v", "libvpx-vp9", "-crf", str(crf), "-b:v", "0", "-c:a", "libopus"]

    if output_format == "gif":
        # Simple GIF path for now. We can upgrade to palettegen/paletteuse later.
        return ["-an"]

    return [
        "-c:v",
        "libx264",
        "-preset",
        "medium",
        "-crf",
        str(crf),
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-b:a",
        "128k",
        "-movflags",
        "+faststart",
    ]


def _input_args(input_path: str, input_media_kind: str, output_format: str) -> list[str]:
    # Kept as a defensive fallback; normal render requests preserve input media kind.
    if input_media_kind == "image" and not output_is_image(output_format):
        return ["-loop", "1", "-t", str(IMAGE_TO_VIDEO_SECONDS), "-i", input_path]

    return ["-i", input_path]


def _build_ffmpeg_args(
    input_path: str,
    input_media_kind: str,
    output_path: str,
    request: RenderRequest,
    filter_chain: str,
) -> list[str]:
    output_format = request.output.format.lower()

    args = [
        "-y",
        *_input_args(input_path, input_media_kind, output_format),
        "-vf",
        filter_chain,
    ]

    if output_is_image(output_format):
        return [
            *args,
            "-frames:v",
            "1",
            output_path,
        ]

    return [
        *args,
        "-r",
        str(request.output.fps),
        *_video_codec_args(output_format, request.output.crf),
        output_path,
    ]


def _compact_ffmpeg_error(stderr: str) -> str:
    lines = [line.strip() for line in stderr.splitlines() if line.strip()]
    if not lines:
        return "FFmpeg failed without an error message."

    # Keep the useful tail. FFmpeg is extremely noisy at the top.
    return "\n".join(lines[-16:])


def _safe_filename_part(value: str) -> str:
    normalized = re.sub(r"[^a-zA-Z0-9]+", "-", value.strip().lower()).strip("-")
    return normalized or "vhs"


def _output_filename(job_id: str, request: RenderRequest, output_format: str) -> str:
    date = _safe_filename_part(request.timestamp.date) if request.timestamp.enabled else "no-date"
    preset = _safe_filename_part(request.preset)
    resolution = _safe_filename_part(request.output.resolution)
    return f"flashbackvhs-{preset}-{date}-{resolution}-{job_id}.{output_format}"


def _normalize_output_format(input_media_kind: str, requested_format: str) -> str:
    output_format = requested_format.lower()

    if input_media_kind == "image" and not output_is_image(output_format):
        return DEFAULT_IMAGE_OUTPUT_FORMAT

    if input_media_kind in {"video", "animation"} and output_is_image(output_format):
        return DEFAULT_VIDEO_OUTPUT_FORMAT

    return output_format


def render_file(request: RenderRequest) -> RenderJobResponse:
    input_metadata = get_upload_metadata(request.input_id)
    input_path = get_upload_path(request.input_id)
    input_media_kind = input_metadata["media_kind"]
    output_format = _normalize_output_format(input_media_kind, request.output.format)
    request.output.format = output_format

    effects = effects_for_request(request.preset, request.effects)
    overlay_mode = overlay_for_request(request.preset, request.overlay_mode)
    filter_chain = build_vhs_filter(
        request,
        effects,
        overlay_mode=overlay_mode,
        input_media_kind=input_media_kind,
    )

    job_id = new_id("render")
    output_filename = _output_filename(job_id, request, output_format)
    output_path = get_render_dir() / output_filename

    args = _build_ffmpeg_args(
        input_path=str(input_path),
        input_media_kind=input_media_kind,
        output_path=str(output_path),
        request=request,
        filter_chain=filter_chain,
    )

    result = run_ffmpeg(args, timeout=None)

    base_metadata = {
        "job_id": job_id,
        "input_id": request.input_id,
        "preset": request.preset,
        "overlay_mode": overlay_mode,
        "output_format": output_format,
        "output_filename": output_filename,
        "output_path": str(output_path),
        "media_kind": input_media_kind,
        "download_url": f"/api/render/{job_id}/download",
        "request": request.model_dump(),
        "ffmpeg_args": args,
    }

    if result.returncode != 0:
        error = _compact_ffmpeg_error(result.stderr)
        metadata = {
            **base_metadata,
            "status": "error",
            "error": error,
        }
        save_render_metadata(job_id, metadata)

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "message": "Render failed.",
                "job_id": job_id,
                "error": error,
            },
        )

    metadata = {
        **base_metadata,
        "status": "done",
        "error": None,
    }
    save_render_metadata(job_id, metadata)

    return RenderJobResponse(**metadata)
