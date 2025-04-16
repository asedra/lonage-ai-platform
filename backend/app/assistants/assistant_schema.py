from datetime import datetime
from pydantic import BaseModel, Field

class AssistantBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Asistan adı")
    role_description: str = Field(..., min_length=1, description="Asistanın rol açıklaması")
    base_prompt: str = Field(..., min_length=1, description="Asistanın temel prompt'u")

class AssistantCreate(AssistantBase):
    user_id: int

class AssistantRead(AssistantBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True 