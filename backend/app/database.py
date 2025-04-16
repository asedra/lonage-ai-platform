from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from passlib.context import CryptContext
from .users.user_model import Base, User

# Şifre işlemi için
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Veritabanı URL'si (environment variable'dan alınmalı)
DATABASE_URL = "postgresql+asyncpg://user:password@localhost/ai_assistant"

engine = create_async_engine(DATABASE_URL, echo=True)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Default admin kullanıcısı oluşturma
    async with async_session() as session:
        # Admin kullanıcısını kontrol et
        query = select(User).where(User.email == "admin@lonage.com")
        result = await session.execute(query)
        admin_user = result.scalar_one_or_none()
        
        # Eğer admin kullanıcısı yoksa oluştur
        if not admin_user:
            hashed_password = pwd_context.hash("admin123")
            admin_user = User(
                email="admin@lonage.com",
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