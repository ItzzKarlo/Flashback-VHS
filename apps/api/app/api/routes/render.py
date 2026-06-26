from fastapi import APIRouter
from fastapi.responses import FileResponse

from app.schemas.render import RenderJobResponse, RenderRequest
from app.services.file_service import get_render_metadata, get_render_path
from app.services.render_service import render_file


router = APIRouter()


@router.post("", response_model=RenderJobResponse)
def create_render(request: RenderRequest) -> RenderJobResponse:
    return render_file(request)


@router.get("/{job_id}")
def get_render(job_id: str) -> dict:
    return get_render_metadata(job_id)


@router.get("/{job_id}/download")
def download_render(job_id: str) -> FileResponse:
    metadata = get_render_metadata(job_id)
    output_path = get_render_path(job_id)

    return FileResponse(
        path=output_path,
        filename=metadata.get("output_filename", output_path.name),
        media_type="application/octet-stream",
    )
