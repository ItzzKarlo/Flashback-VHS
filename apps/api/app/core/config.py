from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "FlashbackVHS API"
    APP_ENV: str = "development"
    APP_DEBUG: bool = True

    FRONTEND_URL: str = "http://localhost:3000"
    CORS_ORIGINS: str = "http://localhost:3000"
    ALLOWED_HOSTS: str = "localhost,127.0.0.1,192.168.178.180,flashback-vhs.karlo-cavlovic.dev,tools.karlo-cavlovic.dev"

    STORAGE_ROOT: Path = Path("../../storage")
    UPLOAD_DIR: Path = Path("../../storage/uploads")
    RENDER_DIR: Path = Path("../../storage/renders")
    PREVIEW_DIR: Path = Path("../../storage/previews")
    TEMP_DIR: Path = Path("../../storage/temp")
    USER_DIR: Path = Path("../../storage/users")
    ARTWORK_DIR: Path = Path("../../storage/artworks")

    FFMPEG_PATH: str = "ffmpeg"
    FFPROBE_PATH: str = "ffprobe"
    # Windows FFmpeg drawtext often needs an explicit font file.
    # Consolas gives the timestamp a clean camcorder-ish look.
    FFMPEG_FONT_FILE: str = "C:/Windows/Fonts/consola.ttf"

    MAX_UPLOAD_MB: int = 500

    DATABASE_URL: str = "postgresql+psycopg://flashbackvhs:flashbackvhs@localhost:5432/flashbackvhs"

    ENABLE_GPU: bool = False
    GPU_ENCODER: str = "h264_nvenc"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origins(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.CORS_ORIGINS.split(",")
            if origin.strip()
        ]

    @property
    def allowed_hosts(self) -> list[str]:
        return [
            host.strip()
            for host in self.ALLOWED_HOSTS.split(",")
            if host.strip()
        ]

    @property
    def max_upload_bytes(self) -> int:
        return self.MAX_UPLOAD_MB * 1024 * 1024


@lru_cache
def get_settings() -> Settings:
    return Settings()
