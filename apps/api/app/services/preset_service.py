from fastapi import HTTPException, status

from app.render.presets import get_preset, list_presets
from app.schemas.render import EffectConfig


def all_presets() -> list[dict]:
    return list_presets()


def preset_by_id(preset_id: str) -> dict:
    preset = get_preset(preset_id)

    if not preset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Preset not found: {preset_id}",
        )

    return preset


def effects_for_request(preset_id: str, override: EffectConfig | None) -> EffectConfig:
    if override:
        return override

    preset = preset_by_id(preset_id)
    return EffectConfig(**preset["effects"])


def overlay_for_request(preset_id: str, override: str | None) -> str:
    if override:
        return override

    preset = preset_by_id(preset_id)
    return preset.get("overlay_mode", "classic_timestamp")
