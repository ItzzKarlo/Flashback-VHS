from pydantic import BaseModel


class UploadResponse(BaseModel):
    file_id: str
    original_filename: str
    stored_filename: str
    media_kind: str
    extension: str
    content_type: str | None = None
    size_bytes: int
    render_url: str
    download_url: str
