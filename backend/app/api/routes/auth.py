from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from passlib.context import CryptContext
from typing import Optional
import logging

from app.database import get_db
from app.users.user_model import User
from ..auth import create_access_token

# Loglama
logger = logging.getLogger(__name__)

# Şifre işlemleri için
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Router tanımı
router = APIRouter(tags=["auth"])

# Login form bilgileri
class LoginForm(BaseModel):
    email: str
    password: str

# Token yanıt formatı
class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

@router.post("/auth/login", response_model=TokenResponse)
async def login(form_data: LoginForm, db: AsyncSession = Depends(get_db)):
    """Kullanıcı girişi yapar ve token döndürür"""
    logger.debug(f"Login isteği alındı: {form_data.email}")
    
    # Kullanıcıyı veritabanında ara
    query = select(User).where(User.email == form_data.email)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    
    # Kullanıcı yoksa veya şifre yanlışsa
    if not user or not verify_password(form_data.password, user.hashed_password):
        logger.warning(f"Geçersiz giriş denemesi: {form_data.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Geçersiz e-posta veya şifre",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Token için veri
    token_data = {
        "sub": user.email,
        "id": user.id
    }
    
    # Token oluştur
    access_token = create_access_token(token_data)
    logger.info(f"Başarılı giriş: {user.email}, Kullanıcı ID: {user.id}")
    
    # Bilgileri döndür
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user={
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    ) 