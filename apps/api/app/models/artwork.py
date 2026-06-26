from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base
from app.models.user import User


class Artwork(Base):
    __tablename__ = "artworks"

    artwork_id: Mapped[str] = mapped_column(String(80), primary_key=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False, index=True)
    job_id: Mapped[str] = mapped_column(String(80), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(120), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    preset: Mapped[str] = mapped_column(String(80), nullable=False)
    output_format: Mapped[str] = mapped_column(String(20), nullable=False)
    output_filename: Mapped[str | None] = mapped_column(String(255), nullable=True)
    download_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    thumbnail_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user: Mapped[User] = relationship()
