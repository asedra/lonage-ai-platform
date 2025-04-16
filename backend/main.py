from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db
from app.users.user_router import router as user_router
from app.credits.credit_router import router as credit_router
from app.assistants.assistant_router import router as assistant_router
from app.chat.chat_router import router as chat_router
from app.files.file_router import router as file_router
from app.rag.rag_router import router as rag_router
from app.api.routes.login import router as login_router

app = FastAPI(
    title="AI Assistant Platform",
    description="Çok tenant'lı, kredi bazlı AI Assistant Platform API'si",
    version="1.0.0"
)

# CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Geliştirme ortamı için. Prodüksiyonda spesifik origin'ler belirtilmeli
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router'ları ekle
app.include_router(user_router, prefix="/api")
app.include_router(credit_router)
app.include_router(assistant_router)
app.include_router(chat_router)
app.include_router(file_router)
app.include_router(rag_router)
app.include_router(login_router, prefix="/api")

@app.get("/")
async def root():
    return {
        "message": "AI Assistant Platform API'sine Hoş Geldiniz",
        "status": "active",
        "version": "1.0.0"
    }

@app.on_event("startup")
async def startup_event():
    await init_db()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 