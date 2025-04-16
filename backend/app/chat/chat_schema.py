from pydantic import BaseModel, Field

class PromptRequest(BaseModel):
    user_id: int = Field(..., description="Kullanıcı ID")
    assistant_id: int = Field(..., description="Asistan ID")
    message: str = Field(..., min_length=1, description="Kullanıcı mesajı")

class PromptResponse(BaseModel):
    response: str = Field(..., description="AI asistanın cevabı") 