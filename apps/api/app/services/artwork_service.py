from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.artwork import Artwork
from app.schemas.artwork import ArtworkListResponse, ArtworkResponse, SaveArtworkRequest
from app.schemas.auth import UserPublic
from app.services.file_service import get_render_metadata
from app.utils.ids import new_id


def _iso(value: datetime | str) -> str:
    if isinstance(value, datetime):
        return value.isoformat()

    return value


def _response(item: Artwork) -> ArtworkResponse:
    return ArtworkResponse(
        artwork_id=item.artwork_id,
        user_id=item.user_id,
        job_id=item.job_id,
        title=item.title,
        notes=item.notes,
        preset=item.preset,
        output_format=item.output_format,
        output_filename=item.output_filename,
        download_url=item.download_url,
        thumbnail_url=item.thumbnail_url,
        created_at=_iso(item.created_at),
    )


def list_user_artworks(user: UserPublic, db: Session) -> ArtworkListResponse:
    artworks = db.scalars(
        select(Artwork)
        .where(Artwork.user_id == user.user_id)
        .order_by(Artwork.created_at.desc())
    ).all()
    return ArtworkListResponse(artworks=[_response(item) for item in artworks])


def save_artwork(request: SaveArtworkRequest, user: UserPublic, db: Session) -> ArtworkResponse:
    render = get_render_metadata(request.job_id)

    if render.get("status") != "done":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only completed renders can be saved.",
        )

    existing = db.scalar(
        select(Artwork).where(
            Artwork.user_id == user.user_id,
            Artwork.job_id == request.job_id,
        )
    )
    title = (request.title or render.get("output_filename") or "Untitled VHS render").strip()

    if existing:
        existing.title = title
        existing.notes = request.notes
        db.commit()
        db.refresh(existing)
        return _response(existing)

    artwork = Artwork(
        artwork_id=new_id("artwork"),
        user_id=user.user_id,
        job_id=request.job_id,
        title=title,
        notes=request.notes,
        preset=render.get("preset", "unknown"),
        output_format=render.get("output_format", "unknown"),
        output_filename=render.get("output_filename"),
        download_url=render.get("download_url"),
        thumbnail_url=render.get("download_url")
        if render.get("output_format") in {"jpg", "jpeg", "png", "webp"}
        else None,
    )
    db.add(artwork)
    db.commit()
    db.refresh(artwork)
    return _response(artwork)


def delete_artwork(artwork_id: str, user: UserPublic, db: Session) -> dict:
    artwork = db.scalar(
        select(Artwork).where(
            Artwork.artwork_id == artwork_id,
            Artwork.user_id == user.user_id,
        )
    )

    if not artwork:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Saved work not found.",
        )

    db.delete(artwork)
    db.commit()
    return {"ok": True}
