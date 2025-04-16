from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..users.user_model import Base

class Assistant(Base):
    __tablename__ = "assistants"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    role_description = Column(Text, nullable=False)
    base_prompt = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # İlişki tanımı
    user = relationship("User", back_populates="assistants") 