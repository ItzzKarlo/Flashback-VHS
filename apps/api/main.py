from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from app.api.router import api_router
from app.core.config import get_settings
from app.core.paths import ensure_storage_dirs
from app.db.database import init_db
from app.services.maintenance_service import get_maintenance_status
from app.utils.cleanup import cleanup_old_temporary_files


settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    ensure_storage_dirs()
    init_db()
    cleanup_old_temporary_files()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    debug=settings.APP_DEBUG,
    version="0.2.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.allowed_hosts,
)


@app.middleware("http")
async def maintenance_guard(request, call_next):
    status = get_maintenance_status()
    path = request.url.path
    allowed_prefixes = (
        "/api/health",
        "/api/maintenance",
        "/api/auth",
        "/api/admin",
    )

    if status["enabled"] and path.startswith("/api") and not path.startswith(allowed_prefixes):
        return JSONResponse(
            status_code=503,
            content={
                "detail": {
                    "message": status["message"],
                    "maintenance": True,
                }
            },
        )

    return await call_next(request)


app.include_router(api_router, prefix="/api")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
    )
