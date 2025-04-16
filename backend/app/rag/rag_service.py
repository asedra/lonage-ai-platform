import os
from typing import List, Dict, Any
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import numpy as np

from ..files.file_model import File
from ..assistants.assistant_model import Assistant
from ..chat.chat_llm_service import LLMService
from qdrant_client import QdrantClient
from qdrant_client.http import models

class RagService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.llm_service = LLMService()
        # Qdrant bağlantısı (mock)
        self.qdrant_client = QdrantClient(
            url=os.getenv("QDRANT_URL", "http://localhost:6333"),
            api_key=os.getenv("QDRANT_API_KEY", "")
        )
        self.collection_name = "documents"

    async def get_file_chunks(self, file_id: int) -> List[Dict[str, Any]]:
        """Dosyaya ait chunk'ları Qdrant'dan çeker."""
        try:
            # Mock: Gerçek Qdrant sorgusu yerine örnek veri döndür
            # TODO: Gerçek Qdrant entegrasyonu
            return [
                {
                    "id": f"{file_id}_chunk_{i}",
                    "text": f"Örnek chunk {i} içeriği",
                    "embedding": [0.1] * 1536
                }
                for i in range(5)
            ]
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Chunk çekme hatası: {str(e)}"
            )

    async def get_question_embedding(self, question: str) -> List[float]:
        """Soru için embedding üretir."""
        return await self.llm_service.get_embeddings(question)

    def find_relevant_chunks(self, question_embedding: List[float], chunks: List[Dict[str, Any]], top_k: int = 3) -> List[Dict[str, Any]]:
        """En ilgili chunk'ları bulur."""
        # Mock: Gerçek benzerlik hesaplaması yerine rastgele seçim
        # TODO: Gerçek benzerlik hesaplaması
        return chunks[:top_k]

    def create_rag_prompt(self, base_prompt: str, chunks: List[Dict[str, Any]], question: str) -> str:
        """RAG prompt'unu oluşturur."""
        chunks_text = "\n\n".join([f"Chunk {i+1}:\n{chunk['text']}" for i, chunk in enumerate(chunks)])
        
        return f"""{base_prompt}

Aşağıdaki metin parçalarını kullanarak soruyu yanıtla:

{chunks_text}

Soru: {question}

Cevap:"""

    async def process_rag_query(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """RAG sorgusunu işler."""
        # Dosyayı kontrol et
        query = select(File).where(File.id == request["file_id"])
        result = await self.db.execute(query)
        file = result.scalar_one_or_none()
        
        if not file:
            raise HTTPException(status_code=404, detail="Dosya bulunamadı")

        # Asistanı kontrol et
        query = select(Assistant).where(Assistant.id == request["assistant_id"])
        result = await self.db.execute(query)
        assistant = result.scalar_one_or_none()
        
        if not assistant:
            raise HTTPException(status_code=404, detail="Asistan bulunamadı")

        # Chunk'ları çek
        chunks = await self.get_file_chunks(request["file_id"])
        
        # Soru için embedding üret
        question_embedding = await self.get_question_embedding(request["question"])
        
        # İlgili chunk'ları bul
        relevant_chunks = self.find_relevant_chunks(question_embedding, chunks)
        
        # RAG prompt'unu oluştur
        prompt = self.create_rag_prompt(
            assistant.base_prompt,
            relevant_chunks,
            request["question"]
        )
        
        # LLM'den cevap al
        answer = await self.llm_service.get_response(prompt, "")
        
        return {
            "answer": answer,
            "source_chunks": [chunk["text"] for chunk in relevant_chunks]
        } 