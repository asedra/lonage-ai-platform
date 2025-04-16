from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.users.user_model import Base

class AIModel(Base):
    __tablename__ = "ai_models"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, index=True)  # "openai" | "ollama"
    api_key = Column(String, nullable=True)
    ollama_url = Column(String, nullable=True)
    ollama_model = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # İlişki tanımları - kullanıcıya bağlantı
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="ai_models") 