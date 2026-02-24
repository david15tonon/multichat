from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from app.models.user import LanguageEnum, MessageToneEnum
from app.models.message import MessageStatusEnum, TranslationStatusEnum
from app.schemas.user import UserPublic


# Message Schemas
class MessageBase(BaseModel):
    """Base message schema"""
    content: str = Field(..., min_length=1, max_length=10000)
    tone: MessageToneEnum = MessageToneEnum.STANDARD


class MessageCreate(MessageBase):
    """Schema for creating a message"""
    receiver_id: UUID
    original_language: Optional[LanguageEnum] = None


class MessageUpdate(BaseModel):
    """Schema for updating a message"""
    content: Optional[str] = Field(None, min_length=1, max_length=10000)
    status: Optional[MessageStatusEnum] = None


class MessageInDB(MessageBase):
    """Schema for message in database"""
    id: UUID
    sender_id: UUID
    receiver_id: UUID
    conversation_id: UUID
    original_language: LanguageEnum
    translated_content: Optional[str] = None
    target_language: Optional[LanguageEnum] = None
    status: MessageStatusEnum
    translation_status: Optional[TranslationStatusEnum] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    read_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class MessagePublic(BaseModel):
    """Public message information"""
    id: UUID
    content: str
    original_language: LanguageEnum
    translated_content: Optional[str] = None
    target_language: Optional[LanguageEnum] = None
    tone: MessageToneEnum
    status: MessageStatusEnum
    translation_status: Optional[TranslationStatusEnum] = None
    sender_id: UUID
    receiver_id: UUID
    created_at: datetime
    read_at: Optional[datetime] = None
    
    # Optional: Include sender info
    sender: Optional[UserPublic] = None
    
    class Config:
        from_attributes = True


# Conversation Schemas
class ConversationBase(BaseModel):
    """Base conversation schema"""
    is_group: bool = False
    name: Optional[str] = Field(None, max_length=255)


class ConversationCreate(ConversationBase):
    """Schema for creating a conversation"""
    participant_ids: List[UUID] = Field(..., min_length=1)


class ConversationInDB(ConversationBase):
    """Schema for conversation in database"""
    id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class ConversationPublic(BaseModel):
    """Public conversation information"""
    id: UUID
    is_group: bool
    name: Optional[str] = None
    participants: List[UserPublic]
    last_message: Optional[MessagePublic] = None
    unread_count: int = 0
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class ConversationWithMessages(ConversationPublic):
    """Conversation with full message history"""
    messages: List[MessagePublic]


# WebSocket Schemas
class WSMessage(BaseModel):
    """WebSocket message format"""
    type: str  # "message", "typing", "read", "delivered", etc.
    data: dict


class WSMessageOut(BaseModel):
    """WebSocket outgoing message"""
    type: str
    message: MessagePublic
    conversation_id: UUID
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class WSTypingIndicator(BaseModel):
    """Typing indicator"""
    type: str = "typing"
    user_id: UUID
    conversation_id: UUID
    is_typing: bool


class WSReadReceipt(BaseModel):
    """Read receipt"""
    type: str = "read"
    message_id: UUID
    user_id: UUID
    read_at: datetime


# Translation Schemas
class TranslationRequest(BaseModel):
    """Translation request"""
    text: str
    source_language: LanguageEnum
    target_language: LanguageEnum
    tone: MessageToneEnum = MessageToneEnum.STANDARD


class TranslationResponse(BaseModel):
    """Translation response"""
    translated_text: str
    source_language: LanguageEnum
    target_language: LanguageEnum
    confidence: Optional[float] = None
