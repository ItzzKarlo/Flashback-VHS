from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.artwork import ArtworkListResponse, ArtworkResponse, SaveArtworkRequest
from app.schemas.auth import UserPublic
from app.services.artwork_service import delete_artwork, list_user_artworks, save_artwork
from app.services.auth_service import get_current_user


router = APIRouter()


@router.get("", response_model=ArtworkListResponse)
def list_artworks(
    user: UserPublic = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ArtworkListResponse:
    return list_user_artworks(user, db)


@router.post("", response_model=ArtworkResponse)
def create_artwork(
    request: SaveArtworkRequest,
    user: UserPublic = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ArtworkResponse:
    return save_artwork(request, user, db)


@router.delete("/{artwork_id}")
def remove_artwork(
    artwork_id: str,
    user: UserPublic = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    return delete_artwork(artwork_id, user, db)
