import re
from typing import Literal

from pydantic import BaseModel, Field, field_validator


TimestampPosition = Literal[
    "top_left",
    "top_right",
    "bottom_left",
    "bottom_right",
]

OverlayMode = Literal[
    "classic_timestamp",
    "rec_camcorder",
    "play_vhs_1985",
    "camera_source_iphone",
    "dirty_camcorder",
    "retro_tape_glitch",
]

OutputFormat = Literal["mp4", "webm", "gif", "jpg", "jpeg", "png", "webp"]


class TimestampConfig(BaseModel):
    enabled: bool = True
    date: str = "06/26/1998"
    time: str = "21:42"
    label: str | None = None
    position: TimestampPosition = "bottom_left"


class OverlayConfig(BaseModel):
    rec_indicator: bool = True
    play_label: bool = True
    vhs_label: bool = True
    tape_speed: bool = True
    counter: bool = True
    corner_brackets: bool = True
    date_block: bool = True
    glitch: float = Field(default=0.65, ge=0, le=1)


class OutputConfig(BaseModel):
    format: OutputFormat = "mp4"
    resolution: str = "1080x1080"
    fps: int = Field(default=30, ge=1, le=120)
    crf: int = Field(default=20, ge=1, le=35)

    @field_validator("resolution")
    @classmethod
    def validate_resolution(cls, value: str) -> str:
        normalized = value.lower().strip()
        if not re.fullmatch(r"\d{2,5}x\d{2,5}", normalized):
            raise ValueError("resolution must look like 1080x1080")

        width, height = [int(part) for part in normalized.split("x")]
        if width < 64 or height < 64:
            raise ValueError("resolution must be at least 64x64")
        if width > 7680 or height > 7680:
            raise ValueError("resolution is too large")

        return normalized


class EffectConfig(BaseModel):
    noise: float = Field(default=0.35, ge=0, le=1)
    scanlines: float = Field(default=0.25, ge=0, le=1)
    blur: float = Field(default=0.15, ge=0, le=1)
    contrast: float = Field(default=1.08, ge=0.5, le=2)
    saturation: float = Field(default=0.82, ge=0, le=2)
    brightness: float = Field(default=-0.02, ge=-1, le=1)
    sharpen: float = Field(default=0.15, ge=0, le=1)


class RenderRequest(BaseModel):
    input_id: str
    preset: str = "classic_vhs"
    overlay_mode: OverlayMode | None = None
    overlay: OverlayConfig = Field(default_factory=OverlayConfig)
    timestamp: TimestampConfig = Field(default_factory=TimestampConfig)
    output: OutputConfig = Field(default_factory=OutputConfig)
    effects: EffectConfig | None = None


class RenderJobResponse(BaseModel):
    job_id: str
    status: str
    input_id: str
    preset: str
    output_filename: str | None = None
    output_format: str
    output_resolution: str | None = None
    media_kind: str
    download_url: str | None = None
    render_duration_seconds: float | None = None
    created_at: str | None = None
    error: str | None = None


class PreviewResponse(BaseModel):
    preview_id: str
    status: str
    input_id: str
    preset: str
    overlay_mode: str
    output_filename: str | None = None
    output_format: str = "jpg"
    media_kind: str
    preview_url: str | None = None
    error: str | None = None
