from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import httpx
import json

from .chat_schema import PromptRequest, PromptResponse, ChatRequest, ChatResponse
from .chat_llm_service import LLMService
from ..assistants.assistant_model import Assistant
from ..credits.credit_service import CreditService
from ..database import get_db

router = APIRouter(prefix="/chat", tags=["chat"])
llm_service = LLMService()

@router.post("/assistant", response_model=PromptResponse)
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

@router.post("/", response_model=ChatResponse)
async def chat_with_model(
    request: Request
):
    try:
        # JSON verisini manuel olarak ayrıştır
        payload = await request.json()
        
        # Zorunlu alan kontrolü
        if "model_type" not in payload:
            raise HTTPException(status_code=400, detail="model_type alanı gereklidir")
        if "model" not in payload:
            raise HTTPException(status_code=400, detail="model alanı gereklidir")
        if "messages" not in payload:
            raise HTTPException(status_code=400, detail="messages alanı gereklidir")
            
        # model_type değeri kontrolü
        if payload["model_type"] not in ["openai", "ollama"]:
            raise HTTPException(status_code=400, detail="model_type 'openai' veya 'ollama' olmalıdır")
            
        # model_type'a göre özel alanların kontrolü
        if payload["model_type"] == "openai" and "api_key" not in payload:
            raise HTTPException(status_code=400, detail="OpenAI için api_key gereklidir")
            
        if payload["model_type"] == "ollama" and "ollama_url" not in payload:
            raise HTTPException(status_code=400, detail="Ollama için ollama_url gereklidir")
        
        # OpenAI API için istek
        if payload["model_type"] == "openai":
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {payload['api_key']}"
                    },
                    json={
                        "model": payload["model"],
                        "messages": payload["messages"],
                        "temperature": 0.7
                    }
                )
                
                if response.status_code != 200:
                    raise HTTPException(
                        status_code=response.status_code,
                        detail=f"OpenAI API hatası: {response.text}"
                    )
                
                result = response.json()
                return ChatResponse(
                    content=result.get("choices", [{}])[0].get("message", {}).get("content", "")
                )
                
        # Ollama API için istek
        elif payload["model_type"] == "ollama":
            # Ollama URL'i trailing slash'ı kaldırma
            base_url = payload["ollama_url"].rstrip("/")
            
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{base_url}/api/chat",
                    json={
                        "model": payload["model"],
                        "messages": payload["messages"],
                        "stream": False
                    }
                )
                
                if response.status_code != 200:
                    raise HTTPException(
                        status_code=response.status_code,
                        detail=f"Ollama API hatası: {response.text}"
                    )
                
                result = response.json()
                return ChatResponse(
                    content=result.get("message", {}).get("content", "")
                )
        
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Geçersiz model türü: {payload['model_type']}"
            )
            
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=400,
            detail="Geçersiz JSON formatı"
        )
    except KeyError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Eksik alan: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Chat işlemi sırasında hata: {str(e)}"
        ) 