from datetime import datetime
from pydantic import BaseModel, Field
from typing import List

class FileInfo(BaseModel):
    id: int
    file_name: str
    file_path: str
    created_at: datetime

    class Config:
        from_attributes = True

class FileUploadResponse(BaseModel):
    message: str = Field(..., description="Yükleme durumu mesajı")
    files: List[FileInfo] = Field(..., description="Yüklenen dosyaların bilgileri") 