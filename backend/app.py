from fastapi import FastAPI, HTTPException, Body, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from jose import jwt
from datetime import datetime, timedelta
import os
import uuid
import databases
import sqlalchemy
from typing import List, Optional, Dict, Any
from contextlib import asynccontextmanager
from sqlalchemy import and_
import bcrypt

# SQLite veritabanı bağlantısı
DATABASE_URL = "sqlite:///./test.db"
database = databases.Database(DATABASE_URL)

# SQLAlchemy modeli
metadata = sqlalchemy.MetaData()

users = sqlalchemy.Table(
    "users",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column("name", sqlalchemy.String, nullable=False),
    sqlalchemy.Column("email", sqlalchemy.String, unique=True, nullable=False),
    sqlalchemy.Column("role", sqlalchemy.String, nullable=False, default="Kullanıcı"),
    sqlalchemy.Column("hashed_password", sqlalchemy.String, nullable=False),
    sqlalchemy.Column("is_active", sqlalchemy.Boolean, nullable=False, default=True),
    sqlalchemy.Column("created_at", sqlalchemy.DateTime, nullable=False, default=sqlalchemy.func.now()),
    sqlalchemy.Column("last_login", sqlalchemy.DateTime, nullable=True),
)

# Veritabanı oluştur
engine = sqlalchemy.create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
metadata.create_all(engine)

# Pydantic modelleri
class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str = "Kullanıcı"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class UserUpdate(UserBase):
    pass

# JWT ayarları
SECRET_KEY = "test_secret_key_DO_NOT_USE_IN_PRODUCTION"  # Gerçek uygulamada environment variable'dan alınmalı
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Şifre hashleme
def get_password_hash(password: str) -> str:
    # Şifreyi bytes'a çevir
    password_bytes = password.encode('utf-8')
    # Tuz üret ve hashle
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password_bytes, salt)
    # Hash'i string olarak döndür
    return hashed_password.decode('utf-8')

# Şifre kontrolü
def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Şifre doğrulama
    return bcrypt.checkpw(
        plain_password.encode('utf-8'),
        hashed_password.encode('utf-8')
    )

# JWT Token oluşturma fonksiyonu
def create_access_token(data: dict, expires_delta: timedelta = None):
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

# Lifespan yönetimi için context manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await database.connect()
    yield
    # Shutdown
    await database.disconnect()

# FastAPI uygulaması
app = FastAPI(title="AI Assistant Platform API", lifespan=lifespan)

# CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Geliştirme ortamı için
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API endpoint'leri
@app.get("/api/users", response_model=List[UserResponse])
async def get_users():
    query = users.select()
    return await database.fetch_all(query)

@app.post("/api/users", response_model=UserResponse)
async def create_user(user: UserCreate):
    # Email unique kontrolü
    query = users.select().where(users.c.email == user.email)
    existing_user = await database.fetch_one(query)
    if existing_user:
        raise HTTPException(status_code=400, detail="Bu e-posta adresi zaten kullanılıyor")
    
    # Yeni kullanıcı oluşturma - bcrypt ile şifre hashleme
    hashed_password = get_password_hash(user.password)
    query = users.insert().values(
        name=user.name,
        email=user.email,
        role=user.role,
        hashed_password=hashed_password,
        is_active=True,
        created_at=datetime.now()
    )
    
    user_id = await database.execute(query)
    
    # Oluşturulan kullanıcıyı getir
    query = users.select().where(users.c.id == user_id)
    return await database.fetch_one(query)

@app.delete("/api/users/{user_id}", response_model=UserResponse)
async def delete_user(user_id: int):
    query = users.select().where(users.c.id == user_id)
    user = await database.fetch_one(query)
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    
    query = users.delete().where(users.c.id == user_id)
    await database.execute(query)
    return user

@app.put("/api/users/{user_id}", response_model=UserResponse)
async def update_user(user_id: int, user_data: UserUpdate):
    # Kullanıcının varlığını kontrol et
    query = users.select().where(users.c.id == user_id)
    existing_user = await database.fetch_one(query)
    
    if not existing_user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    
    # Email kullanımda mı diye kontrol et (aynı email başka kullanıcıda varsa hata döndür)
    if user_data.email != existing_user["email"]:
        query = users.select().where(
            and_(
                users.c.email == user_data.email,
                users.c.id != user_id
            )
        )
        email_exists = await database.fetch_one(query)
        if email_exists:
            raise HTTPException(status_code=400, detail="Bu e-posta adresi zaten kullanılıyor")
    
    # Kullanıcıyı güncelle
    query = users.update().where(users.c.id == user_id).values(
        name=user_data.name,
        email=user_data.email,
        role=user_data.role
    )
    await database.execute(query)
    
    # Güncellenmiş kullanıcıyı getir
    query = users.select().where(users.c.id == user_id)
    return await database.fetch_one(query)

@app.get("/api/users/me", response_model=UserResponse)
async def get_current_user(request: Request):
    # Bearer token al
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Yetkilendirme başlığı eksik veya geçersiz")
    
    # Token ayırma
    try:
        token = auth_header.split(" ")[1]
        if not token or token == "null" or token == "undefined":
            raise HTTPException(status_code=401, detail="Geçersiz token formatı")
    except IndexError:
        raise HTTPException(status_code=401, detail="Geçersiz Authorization başlığı formatı")
    
    try:
        # Token'ı doğrula
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("id")
        
        if user_id is None:
            raise HTTPException(status_code=401, detail="Geçersiz yetkilendirme token'ı: 'id' alanı eksik")
        
        # Kullanıcı bilgilerini getir
        query = users.select().where(users.c.id == user_id)
        user = await database.fetch_one(query)
        
        if not user:
            raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
        
        return user
    except jwt.JWTError as e:
        # Daha detaylı hata mesajı
        error_detail = f"Token doğrulama hatası: {str(e)}"
        raise HTTPException(status_code=401, detail=error_detail)
    except Exception as e:
        # Beklenmeyen hatalar için
        error_detail = f"Beklenmeyen bir hata oluştu: {str(e)}"
        raise HTTPException(status_code=500, detail=error_detail)

# Kök endpoint
@app.get("/")
async def root():
    return {"message": "AI Assistant Platform API'sine Hoş Geldiniz"}

class LoginRequest(BaseModel):
    email: str
    password: str

# Giriş için endpoint
@app.post("/api/auth/login")
async def login(login_data: LoginRequest):
    # Kullanıcı kontrolü
    query = users.select().where(users.c.email == login_data.email)
    user = await database.fetch_one(query)
    
    if not user:
        raise HTTPException(status_code=401, detail="Geçersiz e-posta veya şifre")
    
    # Şifre kontrolü
    if not verify_password(login_data.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Geçersiz e-posta veya şifre")
    
    # Kullanıcı aktif mi kontrolü
    if not user["is_active"]:
        raise HTTPException(status_code=401, detail="Kullanıcı hesabı pasif durumdadır")
    
    # Token için veri
    token_data = {
        "sub": user["email"],
        "id": user["id"],
        "jti": str(uuid.uuid4())
    }
    
    # Son giriş tarihini güncelle
    query = users.update().where(users.c.id == user["id"]).values(
        last_login=datetime.now()
    )
    await database.execute(query)
    
    # JWT token oluştur
    access_token = create_access_token(token_data)
    
    # Başarılı login durumunda kullanıcı bilgilerini döndür
    result = {
        "access_token": access_token,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"]
        }
    }
    
    return result

@app.options("/api/login")
async def options():
    return {}

# Uygulama başlatma (doğrudan çalıştırılırsa)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 