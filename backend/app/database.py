from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from passlib.context import CryptContext
from .users.user_model import Base, User
import os

# Şifre işlemi için
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# SQLite veritabanı dosya yolu (backend klasörü altında ai_assistant.db olarak)
DATABASE_URL = "sqlite+aiosqlite:///ai_assistant.db"

# Async engine oluştur
engine = create_async_engine(DATABASE_URL, echo=True)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Default admin kullanıcısı oluşturma
    async with async_session() as session:
        query = select(User).where(User.email == "admin@lonage.com")
        result = await session.execute(query)
        admin_user = result.scalar_one_or_none()

        if not admin_user:
            hashed_password = pwd_context.hash("admin123")
            admin_user = User(
                email="admin@lonage.com",
                name="Admin",  # name alanı zorunlu olduğu için eklendi
                role="Admin",
                hashed_password=hashed_password,
                is_active=True
            )
            session.add(admin_user)
            await session.commit()
            print("Default admin kullanıcısı oluşturuldu: admin@lonage.com")

async def get_db():
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()
