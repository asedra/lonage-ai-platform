from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from .assistant_model import Assistant
from .assistant_schema import AssistantCreate

class AssistantService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_assistant(self, assistant_data: AssistantCreate) -> Assistant:
        # Yeni asistan oluştur
        assistant = Assistant(
            user_id=assistant_data.user_id,
            name=assistant_data.name,
            role_description=assistant_data.role_description,
            base_prompt=assistant_data.base_prompt
        )
        self.db.add(assistant)
        await self.db.commit()
        await self.db.refresh(assistant)
        return assistant

    async def get_user_assistants(self, user_id: int) -> List[Assistant]:
        query = select(Assistant).where(Assistant.user_id == user_id)
        result = await self.db.execute(query)
        assistants = result.scalars().all()
        return assistants 