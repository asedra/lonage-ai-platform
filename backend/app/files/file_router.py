import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import shutil
from datetime import datetime

from .file_model import File
from .file_schema import FileUploadResponse, FileInfo
from .embedding_service import EmbeddingService
from ..database import get_db

router = APIRouter(prefix="/files", tags=["files"])
embedding_service = EmbeddingService()

# Storage dizini yolu
STORAGE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "storage")

@router.post("/upload", response_model=FileUploadResponse)
async def upload_files(
    user_id: int,
    files: List[UploadFile] = File(...),
    db: AsyncSession = Depends(get_db)
):
    uploaded_files = []
    
    for file in files:
        # Dosya uzantısını kontrol et
        if not file.filename.endswith(('.txt', '.pdf')):
            raise HTTPException(
                status_code=400,
                detail=f"Desteklenmeyen dosya formatı: {file.filename}"
            )
        
        # Dosya adını benzersiz yap
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_filename = f"{timestamp}_{file.filename}"
        file_path = os.path.join(STORAGE_DIR, unique_filename)
        
        # Dosyayı kaydet
        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Dosya kaydetme hatası: {str(e)}"
            )
        
        # Veritabanına kaydet
        db_file = File(
            user_id=user_id,
            file_name=file.filename,
            file_path=file_path
        )
        db.add(db_file)
        await db.commit()
        await db.refresh(db_file)
        
        # Embedding işlemini başlat
        try:
            await embedding_service.process_file(file_path, db_file.id)
        except Exception as e:
            # Embedding hatası durumunda dosyayı sil
            os.remove(file_path)
            raise HTTPException(
                status_code=500,
                detail=f"Embedding işlemi hatası: {str(e)}"
            )
        
        uploaded_files.append(FileInfo(
            id=db_file.id,
            file_name=db_file.file_name,
            file_path=db_file.file_path,
            created_at=db_file.created_at
        ))
    
    return FileUploadResponse(
        message=f"{len(uploaded_files)} dosya başarıyla yüklendi",
        files=uploaded_files
    )

@router.get("/{user_id}", response_model=List[FileInfo])
async def get_user_files(
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    query = select(File).where(File.user_id == user_id)
    result = await db.execute(query)
    files = result.scalars().all()
    
    return [
        FileInfo(
            id=file.id,
            file_name=file.file_name,
            file_path=file.file_path,
            created_at=file.created_at
        )
        for file in files
    ] 