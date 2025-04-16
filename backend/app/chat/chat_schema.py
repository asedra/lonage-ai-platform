from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Literal

class PromptRequest(BaseModel):
    assistant_id: int
    user_id: int
    message: str

class PromptResponse(BaseModel):
    response: str

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    model_type: Literal["openai", "ollama"]
    model: str
    messages: List[Dict[str, str]]
    api_key: Optional[str] = None
    ollama_url: Optional[str] = None

class ChatResponse(BaseModel):
    content: str 