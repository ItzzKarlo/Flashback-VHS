from pydantic import BaseModel, Field


class SaveArtworkRequest(BaseModel):
    job_id: str = Field(min_length=1)
    title: str | None = Field(default=None, max_length=120)
    notes: str | None = Field(default=None, max_length=500)


class ArtworkResponse(BaseModel):
    artwork_id: str
    user_id: str
    job_id: str
    title: str
    notes: str | None = None
    preset: str
    output_format: str
    output_filename: str | None = None
    download_url: str | None = None
    thumbnail_url: str | None = None
    created_at: str


class ArtworkListResponse(BaseModel):
    artworks: list[ArtworkResponse]
