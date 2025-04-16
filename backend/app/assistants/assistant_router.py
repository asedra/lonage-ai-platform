from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from .assistant_schema import AssistantCreate, AssistantRead
from .assistant_service import AssistantService
from ..database import get_db

router = APIRouter(prefix="/assistants", tags=["assistants"])

@router.post("/", response_model=AssistantRead)
async def create_assistant(
    assistant_data: AssistantCreate,
    db: AsyncSession = Depends(get_db)
):
    assistant_service = AssistantService(db)
    return await assistant_service.create_assistant(assistant_data)

@router.get("/{user_id}", response_model=List[AssistantRead])
async def get_user_assistants(
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    assistant_service = AssistantService(db)
    return await assistant_service.get_user_assistants(user_id) 