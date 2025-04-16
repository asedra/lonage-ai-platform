from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from .credit_schema import CreditCreate, CreditRead, CreditDecrease
from .credit_service import CreditService
from ..database import get_db

router = APIRouter(prefix="/credits", tags=["credits"])

@router.post("/init", response_model=CreditRead)
async def initialize_credit(
    credit_data: CreditCreate,
    db: AsyncSession = Depends(get_db)
):
    credit_service = CreditService(db)
    return await credit_service.initialize_credit(credit_data)

@router.get("/{user_id}", response_model=CreditRead)
async def get_user_credit(
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    credit_service = CreditService(db)
    return await credit_service.get_user_credit(user_id)

@router.post("/decrease", response_model=CreditRead)
async def decrease_credit(
    credit_data: CreditDecrease,
    db: AsyncSession = Depends(get_db)
):
    credit_service = CreditService(db)
    return await credit_service.decrease_credit(credit_data) 