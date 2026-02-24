from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, Enum as SQLEnum, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
import enum
from app.db.session import Base
from app.models.user import LanguageEnum, MessageToneEnum


class MessageStatusEnum(str, enum.Enum):
    """Message delivery status"""
    SENDING = "sending"
    SENT = "sent"
    DELIVERED = "delivered"
    READ = "read"
    FAILED = "failed"


class TranslationStatusEnum(str, enum.Enum):
    """Translation status"""
    PENDING = "pending"
    TRANSLATING = "translating"
    TRANSLATED = "translated"
    FAILED = "failed"


class Message(Base):
    """Message model"""
    __tablename__ = "messages"
    
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    
    # Content
    content = Column(Text, nullable=False)
    original_language = Column(
        SQLEnum(LanguageEnum),
        nullable=False
    )
    translated_content = Column(Text, nullable=True)
    target_language = Column(
        SQLEnum(LanguageEnum),
        nullable=True
    )
    tone = Column(
        SQLEnum(MessageToneEnum),
        default=MessageToneEnum.STANDARD,
        nullable=False
    )
    
    # Status
    status = Column(
        SQLEnum(MessageStatusEnum),
        default=MessageStatusEnum.SENDING,
        nullable=False
    )
    translation_status = Column(
        SQLEnum(TranslationStatusEnum),
        nullable=True
    )
    
    # Relationships
    sender_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    receiver_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    conversation_id = Column(
        UUID(as_uuid=True),
        ForeignKey("conversations.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    read_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_messages")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="received_messages")
    conversation = relationship("Conversation", back_populates="messages")
    
    def __repr__(self):
        return f"<Message {self.id}>"


class Conversation(Base):
    """Conversation model"""
    __tablename__ = "conversations"
    
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    
    # Metadata
    is_group = Column(Boolean, default=False, nullable=False)
    name = Column(String(255), nullable=True)  # For group chats
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    messages = relationship(
        "Message",
        back_populates="conversation",
        cascade="all, delete-orphan",
        order_by="Message.created_at"
    )
    participants = relationship(
        "ConversationParticipant",
        back_populates="conversation",
        cascade="all, delete-orphan"
    )
    
    def __repr__(self):
        return f"<Conversation {self.id}>"


class ConversationParticipant(Base):
    """Many-to-many relationship between users and conversations"""
    __tablename__ = "conversation_participants"
    
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    conversation_id = Column(
        UUID(as_uuid=True),
        ForeignKey("conversations.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # Metadata
    unread_count = Column(Integer, default=0, nullable=False)
    last_read_at = Column(DateTime(timezone=True), nullable=True)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="conversations")
    conversation = relationship("Conversation", back_populates="participants")
    
    def __repr__(self):
        return f"<ConversationParticipant user={self.user_id} conv={self.conversation_id}>"
