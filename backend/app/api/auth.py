from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from jose import jwt, JWTError
from datetime import datetime, timedelta
from typing import Optional
from pydantic import BaseModel
import logging

from app.database import get_db
from app.users.user_model import User

# Loglama
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# JWT için sabitler
SECRET_KEY = "test_secret_key_DO_NOT_USE_IN_PRODUCTION"  # Gerçek uygulamada environment variable'dan alınmalı
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# OAuth2 şema
# Dikkat: tokenUrl tam olarak endpoint'in URL'i ile eşleşmeli
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# Token oluşturucu sınıf
class Token(BaseModel):
    access_token: str
    token_type: str

# Kimlik doğrulama fonksiyonları
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    
    # Expire time hesaplama
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    
    # Token oluşturma
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Geçersiz kimlik bilgileri",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Token'ı doğrula
        logger.debug(f"Token doğrulanıyor: {token[:10]}...")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("id")
        
        if user_id is None:
            logger.error("Token içinde id alanı bulunamadı")
            raise credentials_exception
    except JWTError as e:
        logger.error(f"JWT doğrulama hatası: {str(e)}")
        raise credentials_exception
    
    # Kullanıcıyı veritabanından al
    logger.debug(f"Kullanıcı ID: {user_id} aranıyor")
    query = select(User).where(User.id == user_id)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    
    if user is None:
        logger.error(f"Kullanıcı ID: {user_id} bulunamadı")
        raise credentials_exception
    
    logger.debug(f"Kullanıcı ID: {user_id} için kimlik doğrulama başarılı")
    return user

# Request header'dan token alarak kullanıcı sorgulama (isteğe bağlı)
async def get_current_user_from_header(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    # Bearer token al
    auth_header = request.headers.get("Authorization")
    logger.debug(f"Alınan Authorization header: {auth_header}")
    
    if not auth_header or not auth_header.startswith("Bearer "):
        logger.error("Authorization header eksik veya geçersiz")
        raise HTTPException(status_code=401, detail="Yetkilendirme başlığı eksik veya geçersiz")
    
    # Token ayırma
    try:
        token = auth_header.split(" ")[1]
        if not token or token == "null" or token == "undefined":
            logger.error("Geçersiz token formatı")
            raise HTTPException(status_code=401, detail="Geçersiz token formatı")
    except IndexError:
        logger.error("Geçersiz Authorization başlığı formatı")
        raise HTTPException(status_code=401, detail="Geçersiz Authorization başlığı formatı")
    
    try:
        # Token'ı doğrula
        logger.debug(f"Token doğrulanıyor: {token[:10]}...")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("id")
        
        if user_id is None:
            logger.error("Token içinde id alanı bulunamadı")
            raise HTTPException(status_code=401, detail="Geçersiz yetkilendirme token'ı: 'id' alanı eksik")
        
        # Kullanıcı bilgilerini getir
        logger.debug(f"Kullanıcı ID: {user_id} aranıyor")
        query = select(User).where(User.id == user_id)
        result = await db.execute(query)
        user = result.scalar_one_or_none()
        
        if not user:
            logger.error(f"Kullanıcı ID: {user_id} bulunamadı")
            raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
        
        logger.debug(f"Kullanıcı ID: {user_id} için kimlik doğrulama başarılı")
        return user
    except JWTError as e:
        # Daha detaylı hata mesajı
        error_detail = f"Token doğrulama hatası: {str(e)}"
        logger.error(error_detail)
        raise HTTPException(status_code=401, detail=error_detail)
    except Exception as e:
        # Beklenmeyen hatalar için
        error_detail = f"Beklenmeyen bir hata oluştu: {str(e)}"
        logger.error(error_detail)
        raise HTTPException(status_code=500, detail=error_detail) 