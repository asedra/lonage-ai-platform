from pydantic import BaseModel, validator
from typing import Optional, List
from datetime import datetime

class AIModelBase(BaseModel):
    name: str
    type: str

class AIModelCreate(AIModelBase):
    api_key: Optional[str] = None
    ollama_url: Optional[str] = None
    ollama_model: Optional[str] = None
    
    @validator('type')
    def validate_model_type(cls, v):
        if v not in ["openai", "ollama"]:
            raise ValueError("Model tipi 'openai' veya 'ollama' olmalıdır")
        return v
    
    @validator('api_key')
    def validate_api_key(cls, v, values):
        if values.get('type') == 'openai' and not v:
            raise ValueError("OpenAI modeli için API key gereklidir")
        return v
    
    @validator('ollama_url')
    def validate_ollama_url(cls, v, values):
        if values.get('type') == 'ollama' and not v:
            raise ValueError("Ollama modeli için ollama_url gereklidir")
        return v
        
    @validator('ollama_model')
    def validate_ollama_model(cls, v, values):
        if values.get('type') == 'ollama' and not v:
            raise ValueError("Ollama modeli için ollama_model gereklidir")
        return v

class AIModelUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    api_key: Optional[str] = None
    ollama_url: Optional[str] = None
    ollama_model: Optional[str] = None

class AIModelRead(AIModelBase):
    id: int
    api_key: Optional[str] = None
    ollama_url: Optional[str] = None
    ollama_model: Optional[str] = None
    created_at: datetime
    user_id: int
    
    class Config:
        from_attributes = True 