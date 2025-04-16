from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from .rag_schema import RagRequest, RagResponse
from .rag_service import RagService
from ..credits.credit_service import CreditService
from ..database import get_db

router = APIRouter(prefix="/rag", tags=["rag"])

@router.post("/query", response_model=RagResponse)
async def query_rag(
    request: RagRequest,
    db: AsyncSession = Depends(get_db)
):
    # Kredi kontrolü ve düşme işlemi
    credit_service = CreditService(db)
    try:
        await credit_service.decrease_credit({
            "user_id": request.user_id,
            "amount": 2.0  # RAG sorgusu için 2 kredi
        })
    except HTTPException as e:
        raise HTTPException(status_code=400, detail="Yetersiz kredi")

    # RAG servisini başlat
    rag_service = RagService(db)
    
    try:
        # RAG sorgusunu işle
        result = await rag_service.process_rag_query({
            "user_id": request.user_id,
            "assistant_id": request.assistant_id,
            "file_id": request.file_id,
            "question": request.question
        })
        
        return RagResponse(
            answer=result["answer"],
            source_chunks=result["source_chunks"]
        )
    except HTTPException as e:
        # Hata durumunda krediyi geri ver
        try:
            await credit_service.initialize_credit({
                "user_id": request.user_id,
                "balance": 2.0
            })
        except:
            pass
        raise e 