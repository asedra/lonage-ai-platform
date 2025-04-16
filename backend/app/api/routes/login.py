from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import jwt
from typing import Optional

from app.database import get_db
from app.users.user_model import User

# Şifre işlemleri için
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT token oluşturmak için sabit değerler
SECRET_KEY = "test_secret_key_DO_NOT_USE_IN_PRODUCTION"  # Gerçek uygulamada environment variable'dan alınmalı
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Token oluşturucu sınıf
class Token(BaseModel):
    access_token: str
    token_type: str

# Kullanıcı bilgileri sınıfı
class UserInfo(BaseModel):
    id: int
    email: str
    name: Optional[str] = "Kullanıcı"  # Kullanıcı adı şimdilik varsayılan olarak "Kullanıcı"

# Login form bilgileri
class LoginForm(BaseModel):
    email: str
    password: str

# Router tanımı
router = APIRouter(tags=["auth"])

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

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

@router.post("/login")
async def login(form_data: LoginForm, db: AsyncSession = Depends(get_db)):
    # Kullanıcıyı veritabanında ara
    query = select(User).where(User.email == form_data.email)
    result = await db.execute(query)
    user = result.scalar_one_or_none()
    
    # Kullanıcı yoksa veya şifre yanlışsa
    if not user or not verify_password(form_data.password, user.hashed_password):
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
    
    # Bilgileri döndür
    return {
        "access_token": access_token,
        "user": {
            "id": user.id,
            "name": "Ali Mehmetoğlu",  # Örnek isim, gerçek uygulamada kullanıcının adı veritabanından gelecek
            "email": user.email
        }
    } 