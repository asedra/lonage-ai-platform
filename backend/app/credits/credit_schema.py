from datetime import datetime
from pydantic import BaseModel, Field

class CreditBase(BaseModel):
    balance: float = Field(ge=0.0, description="Kredi bakiyesi")

class CreditCreate(CreditBase):
    user_id: int

class CreditRead(CreditBase):
    id: int
    user_id: int
    last_updated: datetime
    created_at: datetime

    class Config:
        from_attributes = True

class CreditDecrease(BaseModel):
    user_id: int
    amount: float = Field(gt=0.0, description="Düşülecek kredi miktarı") 