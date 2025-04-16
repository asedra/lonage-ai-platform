from pydantic import BaseModel, Field

class RagRequest(BaseModel):
    user_id: int = Field(..., description="Kullanıcı ID")
    assistant_id: int = Field(..., description="Asistan ID")
    file_id: int = Field(..., description="Dosya ID")
    question: str = Field(..., min_length=1, description="Kullanıcı sorusu")

class RagResponse(BaseModel):
    answer: str = Field(..., description="AI asistanın cevabı")
    source_chunks: list[str] = Field(..., description="Cevabın oluşturulduğu metin parçaları") 