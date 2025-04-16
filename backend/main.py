from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import logging

from app.database import init_db
from app.users.user_router import router as user_router
from app.credits.credit_router import router as credit_router
from app.assistants.assistant_router import router as assistant_router
from app.chat.chat_router import router as chat_router
from app.files.file_router import router as file_router
from app.rag.rag_router import router as rag_router
from app.api.routes.login import router as login_router
from app.ai_models.ai_model_router import router as ai_model_router
from app.api.routes.auth import router as auth_router

# Loglama ayarları
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI Assistant Platform",
    description="Çok tenant'lı, kredi bazlı AI Assistant Platform API'si",
    version="1.0.1"
)

# CORS ayarları - tüm origins ve methodlara izin ver
origins = ["*"]  # Gerçek ortamda belirli domainler kullanılmalıdır
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Router'ları ekle
app.include_router(user_router, prefix="/api")
app.include_router(credit_router)
app.include_router(assistant_router)
app.include_router(chat_router, prefix="/api")
app.include_router(file_router)
app.include_router(rag_router)
app.include_router(login_router, prefix="/api")
app.include_router(ai_model_router)
app.include_router(auth_router, prefix="/api")

@app.get("/")
async def root():
    return {
        "message": "AI Assistant Platform API'sine Hoş Geldiniz",
        "status": "active",
        "version": "1.0.1"
    }

@app.on_event("startup")
async def startup_event():
    # Storage klasörünü oluştur
    storage_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "storage")
    if not os.path.exists(storage_dir):
        os.makedirs(storage_dir)
        logger.info(f"Storage klasörü oluşturuldu: {storage_dir}")
    
    await init_db()
    logger.info("Uygulama başlatıldı ve veritabanı hazırlandı")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 