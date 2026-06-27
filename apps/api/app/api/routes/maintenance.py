from fastapi import APIRouter

from app.services.maintenance_service import get_maintenance_status


router = APIRouter()


@router.get("")
def maintenance_status() -> dict:
    return get_maintenance_status()
