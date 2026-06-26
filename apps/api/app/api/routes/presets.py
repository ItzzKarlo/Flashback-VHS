from fastapi import APIRouter

from app.services.preset_service import all_presets, preset_by_id


router = APIRouter()


@router.get("")
def get_presets() -> dict:
    return {
        "presets": all_presets(),
    }


@router.get("/{preset_id}")
def get_preset(preset_id: str) -> dict:
    return preset_by_id(preset_id)
