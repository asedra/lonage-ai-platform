from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
import httpx
import logging

from .ai_model import AIModel
from .ai_model_schema import AIModelCreate, AIModelRead, AIModelUpdate
from ..database import get_db
from ..api.auth import get_current_user_from_header
from ..users.user_model import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ai-models", tags=["ai_models"])

# Test için bir sabit kullanıcı tanımlayalım
async def get_test_user(db: AsyncSession):
    query = select(User).where(User.email == "admin@lonage.com")
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    if not user:
        logger.warning("Test kullanıcısı bulunamadı, varsayılan değerler kullanılacak")
        # Bulunmazsa varsayılan bir User objesi oluştur
        return User(id=1, name="Test Admin", email="admin@lonage.com")
    return user

@router.get("/", response_model=List[AIModelRead])
async def get_ai_models(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Kullanıcıya ait tüm AI modelleri getirir."""
    try:
        # Kullanıcıyı header'dan al
        current_user = await get_current_user_from_header(request, db)
    except HTTPException as e:
        # Hata durumunda test kullanıcısını kullan
        logger.warning(f"Kimlik doğrulama hatası: {e.detail}. Test kullanıcısı kullanılıyor.")
        current_user = await get_test_user(db)
    
    query = select(AIModel).where(AIModel.user_id == current_user.id)
    result = await db.execute(query)
    models = result.scalars().all()
    return models

@router.get("/{model_id}", response_model=AIModelRead)
async def get_ai_model(
    model_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Belirli bir AI modelini ID'ye göre getirir."""
    try:
        # Kullanıcıyı header'dan al
        current_user = await get_current_user_from_header(request, db)
    except HTTPException as e:
        # Hata durumunda test kullanıcısını kullan
        logger.warning(f"Kimlik doğrulama hatası: {e.detail}. Test kullanıcısı kullanılıyor.")
        current_user = await get_test_user(db)
    
    query = select(AIModel).where(
        AIModel.id == model_id,
        AIModel.user_id == current_user.id
    )
    result = await db.execute(query)
    model = result.scalar_one_or_none()
    
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model bulunamadı"
        )
        
    return model

@router.post("/", response_model=AIModelRead)
async def create_ai_model(
    model: AIModelCreate,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Yeni bir AI modeli oluşturur."""
    try:
        # Kullanıcıyı header'dan al
        current_user = await get_current_user_from_header(request, db)
    except HTTPException as e:
        # Hata durumunda test kullanıcısını kullan
        logger.warning(f"Kimlik doğrulama hatası: {e.detail}. Test kullanıcısı kullanılıyor.")
        current_user = await get_test_user(db)
    
    # Ollama modelini doğrula
    if model.type == "ollama" and model.ollama_url and model.ollama_model:
        try:
            # URL'den trailing slash'ı kaldırma
            base_url = model.ollama_url
            if base_url.endswith("/"):
                base_url = base_url[:-1]
                
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{base_url}/api/tags", timeout=5.0)
                response.raise_for_status()
                data = response.json()
                
                if not data.get("models"):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Ollama sunucusunda model listesi bulunamadı."
                    )
                    
                # Ollama API farklı bir yapıda dönebilir, uyumluluğu kontrol et
                models_list = data.get("models", [])
                
                # Bazı Ollama API versiyonları model listesini farklı formatta dönebilir
                if isinstance(models_list, list) and all(isinstance(item, str) for item in models_list):
                    # Eğer model listesi string dizisi ise, nesne formatına dönüştür
                    models_list = [{"name": name} for name in models_list]
                
                # Modelin varlığını kontrol et
                model_names = [model.get("name") for model in models_list if model.get("name")]
                
                if not model_names:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Ollama sunucusunda model bulunamadı."
                    )
                    
                if model.ollama_model not in model_names:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST, 
                        detail=f"'{model.ollama_model}' modeli Ollama sunucusunda bulunamadı. Mevcut modeller: {', '.join(model_names)}"
                    )
                    
        except httpx.HTTPError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ollama sunucusuna bağlanılamadı: {str(e)}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Ollama bağlantısı sırasında hata: {str(e)}"
            )
    
    # Yeni AI modelini oluştur
    db_model = AIModel(
        name=model.name,
        type=model.type,
        api_key=model.api_key if model.type == "openai" else None,
        ollama_url=model.ollama_url if model.type == "ollama" else None,
        ollama_model=model.ollama_model if model.type == "ollama" else None,
        user_id=current_user.id
    )
    
    db.add(db_model)
    await db.commit()
    await db.refresh(db_model)
    
    return db_model

@router.put("/{model_id}", response_model=AIModelRead)
async def update_ai_model(
    model_id: int,
    model_update: AIModelUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Mevcut bir AI modelini günceller."""
    try:
        # Kullanıcıyı header'dan al
        current_user = await get_current_user_from_header(request, db)
    except HTTPException as e:
        # Hata durumunda test kullanıcısını kullan
        logger.warning(f"Kimlik doğrulama hatası: {e.detail}. Test kullanıcısı kullanılıyor.")
        current_user = await get_test_user(db)
    
    # Güncellenecek modeli bul
    query = select(AIModel).where(
        AIModel.id == model_id,
        AIModel.user_id == current_user.id
    )
    result = await db.execute(query)
    db_model = result.scalar_one_or_none()
    
    if not db_model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model bulunamadı"
        )
    
    # Güncellenecek alanları işle
    update_data = model_update.dict(exclude_unset=True)
    
    # Model tipini değiştirmek, alan tiplerini de değiştirmeli
    if "type" in update_data and update_data["type"] != db_model.type:
        if update_data["type"] == "openai":
            # Ollama'dan OpenAI'ya geçiş
            db_model.ollama_url = None
            db_model.ollama_model = None
            # API key zorunlu olmadığı sürece, API key alanı sorgulanmalı
            if "api_key" not in update_data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="OpenAI modeline geçiş yaparken API key gereklidir"
                )
        elif update_data["type"] == "ollama":
            # OpenAI'dan Ollama'ya geçiş
            db_model.api_key = None
            # Ollama URL ve model adı zorunlu olmadığı sürece, bu alanlar sorgulanmalı
            if "ollama_url" not in update_data or "ollama_model" not in update_data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Ollama modeline geçiş yaparken ollama_url ve ollama_model gereklidir"
                )
    
    # Alanları güncelle
    for key, value in update_data.items():
        setattr(db_model, key, value)
    
    await db.commit()
    await db.refresh(db_model)
    
    return db_model

@router.delete("/{model_id}", response_model=AIModelRead)
async def delete_ai_model(
    model_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Bir AI modelini siler."""
    try:
        # Kullanıcıyı header'dan al
        current_user = await get_current_user_from_header(request, db)
    except HTTPException as e:
        # Hata durumunda test kullanıcısını kullan
        logger.warning(f"Kimlik doğrulama hatası: {e.detail}. Test kullanıcısı kullanılıyor.")
        current_user = await get_test_user(db)
    
    # Silinecek modeli bul
    query = select(AIModel).where(
        AIModel.id == model_id,
        AIModel.user_id == current_user.id
    )
    result = await db.execute(query)
    model = result.scalar_one_or_none()
    
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model bulunamadı"
        )
    
    # Modeli sil
    await db.delete(model)
    await db.commit()
    
    return model 