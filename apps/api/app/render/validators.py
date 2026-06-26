from fastapi import HTTPException, status

from app.utils.mime import OUTPUT_FORMATS


def validate_output_format(output_format: str) -> None:
    if output_format.lower() not in OUTPUT_FORMATS:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unsupported output format: {output_format}",
        )
