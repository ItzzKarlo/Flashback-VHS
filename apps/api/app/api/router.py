from fastapi import APIRouter

from app.api.routes import admin, artworks, auth, health, presets, preview, render, stats, upload


api_router = APIRouter()

api_router.include_router(
    health.router,
    prefix="/health",
    tags=["Health"],
)

api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["Auth"],
)

api_router.include_router(
    admin.router,
    prefix="/admin",
    tags=["Admin"],
)

api_router.include_router(
    stats.router,
    prefix="/stats",
    tags=["Stats"],
)

api_router.include_router(
    artworks.router,
    prefix="/artworks",
    tags=["Artworks"],
)

api_router.include_router(
    presets.router,
    prefix="/presets",
    tags=["Presets"],
)

api_router.include_router(
    upload.router,
    prefix="/upload",
    tags=["Upload"],
)

api_router.include_router(
    render.router,
    prefix="/render",
    tags=["Render"],
)

api_router.include_router(
    preview.router,
    prefix="/preview",
    tags=["Preview"],
)
