from typing import Optional
import os
from fastapi import HTTPException

class LLMService:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.model = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")

    def create_prompt(self, base_prompt: str, user_message: str) -> str:
        """Base prompt ve kullanıcı mesajını birleştirerek final prompt'u oluşturur."""
        return f"{base_prompt}\n\nKullanıcı: {user_message}\n\nAsistan:"

    async def call_openai(self, prompt: str) -> str:
        """OpenAI API'sine çağrı yapar ve cevabı döndürür."""
        # TODO: OpenAI API entegrasyonu
        # Şimdilik mock cevap döndürüyoruz
        return f"AI cevabı: {prompt[:50]}..."

    async def get_response(self, base_prompt: str, user_message: str) -> str:
        """Prompt'u oluşturur ve LLM'den cevap alır."""
        try:
            final_prompt = self.create_prompt(base_prompt, user_message)
            response = await self.call_openai(final_prompt)
            return response
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"LLM servisi hatası: {str(e)}"
            ) 