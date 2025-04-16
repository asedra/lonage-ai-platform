from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from .chat_schema import PromptRequest, PromptResponse
from .chat_llm_service import LLMService
from ..assistants.assistant_model import Assistant
from ..credits.credit_service import CreditService
from ..database import get_db

router = APIRouter(prefix="/chat", tags=["chat"])
llm_service = LLMService()

@router.post("/", response_model=PromptResponse)
async def chat_with_assistant(
    request: PromptRequest,
    db: AsyncSession = Depends(get_db)
):
    # Asistanı bul
    query = select(Assistant).where(Assistant.id == request.assistant_id)
    result = await db.execute(query)
    assistant = result.scalar_one_or_none()
    
    if not assistant:
        raise HTTPException(status_code=404, detail="Asistan bulunamadı")

    # Kredi kontrolü ve düşme işlemi
    credit_service = CreditService(db)
    try:
        await credit_service.decrease_credit({
            "user_id": request.user_id,
            "amount": 1.0  # Her mesaj için 1 kredi
        })
    except HTTPException as e:
        raise HTTPException(status_code=400, detail="Yetersiz kredi")

    # LLM'den cevap al
    response = await llm_service.get_response(
        base_prompt=assistant.base_prompt,
        user_message=request.message
    )

    return PromptResponse(response=response) 