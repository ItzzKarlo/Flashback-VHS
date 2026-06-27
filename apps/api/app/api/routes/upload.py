from fastapi import APIRouter, File, UploadFile
from fastapi.responses import FileResponse

from app.schemas.upload import UploadResponse
from app.services.file_service import get_upload_metadata, get_upload_path, save_upload_file


router = APIRouter()


@router.post("", response_model=UploadResponse)
def upload_file(file: UploadFile = File(...)) -> UploadResponse:
    metadata = save_upload_file(file)

    return UploadResponse(
        **metadata,
        render_url="/api/render",
        download_url=f"/api/upload/{metadata['file_id']}/download",
    )


@router.get("/{file_id}/download")
def download_upload(file_id: str) -> FileResponse:
    metadata = get_upload_metadata(file_id)
    upload_path = get_upload_path(file_id)

    return FileResponse(
        path=upload_path,
        filename=metadata.get("original_filename", upload_path.name),
        media_type=metadata.get("content_type") or "application/octet-stream",
    )
