from fastapi import APIRouter
from fastapi.responses import FileResponse

from app.schemas.render import PreviewResponse, RenderRequest
from app.services.file_service import get_preview_metadata, get_preview_path
from app.services.preview_service import create_preview


router = APIRouter()


@router.post("", response_model=PreviewResponse)
def preview_render(request: RenderRequest) -> PreviewResponse:
    return create_preview(request)


@router.get("/{preview_id}/download")
def download_preview(preview_id: str) -> FileResponse:
    metadata = get_preview_metadata(preview_id)
    output_path = get_preview_path(preview_id)

    return FileResponse(
        path=output_path,
        filename=metadata.get("output_filename", output_path.name),
        media_type="image/jpeg",
    )
