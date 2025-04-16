from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from .credit_model import Credit
from .credit_schema import CreditCreate, CreditDecrease

class CreditService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_credit(self, user_id: int) -> Credit:
        query = select(Credit).where(Credit.user_id == user_id)
        result = await self.db.execute(query)
        credit = result.scalar_one_or_none()
        
        if credit is None:
            raise HTTPException(status_code=404, detail="Kullanıcı kredisi bulunamadı")
        return credit

    async def initialize_credit(self, credit_data: CreditCreate) -> Credit:
        # Kullanıcının mevcut kredisi var mı kontrol et
        query = select(Credit).where(Credit.user_id == credit_data.user_id)
        result = await self.db.execute(query)
        if result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Kullanıcının zaten kredisi mevcut")

        # Yeni kredi oluştur
        credit = Credit(
            user_id=credit_data.user_id,
            balance=credit_data.balance
        )
        self.db.add(credit)
        await self.db.commit()
        await self.db.refresh(credit)
        return credit

    async def decrease_credit(self, credit_data: CreditDecrease) -> Credit:
        credit = await self.get_user_credit(credit_data.user_id)
        
        if credit.balance < credit_data.amount:
            raise HTTPException(
                status_code=400,
                detail=f"Yetersiz kredi. Mevcut bakiye: {credit.balance}"
            )

        credit.balance -= credit_data.amount
        await self.db.commit()
        await self.db.refresh(credit)
        return credit 