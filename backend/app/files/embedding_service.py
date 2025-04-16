import os
from typing import List, Dict, Any
from fastapi import HTTPException
import PyPDF2
from qdrant_client import QdrantClient
from qdrant_client.http import models

class EmbeddingService:
    def __init__(self):
        # Qdrant bağlantısı (mock)
        self.qdrant_client = QdrantClient(
            url=os.getenv("QDRANT_URL", "http://localhost:6333"),
            api_key=os.getenv("QDRANT_API_KEY", "")
        )
        self.collection_name = "documents"

    def read_text_file(self, file_path: str) -> str:
        """Text dosyasını okur."""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                return file.read()
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Dosya okuma hatası: {str(e)}"
            )

    def read_pdf_file(self, file_path: str) -> str:
        """PDF dosyasını okur ve metne dönüştürür."""
        try:
            text = ""
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
            return text
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"PDF okuma hatası: {str(e)}"
            )

    def chunk_text(self, text: str, chunk_size: int = 1000) -> List[str]:
        """Metni chunk'lara ayırır."""
        words = text.split()
        chunks = []
        current_chunk = []
        current_size = 0

        for word in words:
            current_size += len(word) + 1  # +1 for space
            if current_size > chunk_size:
                chunks.append(" ".join(current_chunk))
                current_chunk = [word]
                current_size = len(word)
            else:
                current_chunk.append(word)

        if current_chunk:
            chunks.append(" ".join(current_chunk))

        return chunks

    async def get_embeddings(self, text: str) -> List[float]:
        """OpenAI API'sini kullanarak embedding üretir (mock)."""
        # TODO: OpenAI API entegrasyonu
        # Şimdilik mock embedding döndürüyoruz
        return [0.1] * 1536  # OpenAI embedding boyutu

    async def store_embeddings(self, file_id: int, chunks: List[str]) -> None:
        """Embedding'leri Qdrant'a kaydeder."""
        try:
            # Her chunk için embedding üret ve kaydet
            for i, chunk in enumerate(chunks):
                embedding = await this.get_embeddings(chunk)
                
                # Qdrant'a kaydet (mock)
                # TODO: Gerçek Qdrant entegrasyonu
                print(f"Embedding kaydedildi: file_id={file_id}, chunk={i}")
                
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Embedding kaydetme hatası: {str(e)}"
            )

    async def process_file(self, file_path: str, file_id: int) -> None:
        """Dosyayı işler ve embedding'leri kaydeder."""
        # Dosya uzantısına göre okuma yöntemini belirle
        if file_path.endswith('.txt'):
            text = self.read_text_file(file_path)
        elif file_path.endswith('.pdf'):
            text = self.read_pdf_file(file_path)
        else:
            raise HTTPException(
                status_code=400,
                detail="Desteklenmeyen dosya formatı"
            )

        # Metni chunk'lara ayır
        chunks = self.chunk_text(text)

        # Embedding'leri üret ve kaydet
        await self.store_embeddings(file_id, chunks) 