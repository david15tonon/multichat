from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, desc
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from uuid import UUID
from datetime import datetime

from app.models.message import Message, Conversation, ConversationParticipant, MessageStatusEnum
from app.models.user import User
from app.schemas.message import MessageCreate, ConversationCreate


class MessageService:
    """Message and conversation service"""
    
    @staticmethod
    async def create_conversation(
        db: AsyncSession,
        conversation_create: ConversationCreate,
        creator_id: UUID
    ) -> Conversation:
        """Create a new conversation"""
        # Add creator to participants if not already included
        participant_ids = list(set([creator_id] + conversation_create.participant_ids))
        
        # Check if 1-on-1 conversation already exists
        if not conversation_create.is_group and len(participant_ids) == 2:
            existing = await MessageService.get_conversation_between_users(
                db, participant_ids[0], participant_ids[1]
            )
            if existing:
                return existing
        
        # Create conversation
        conversation = Conversation(
            is_group=conversation_create.is_group,
            name=conversation_create.name
        )
        db.add(conversation)
        await db.flush()
        
        # Add participants
        for user_id in participant_ids:
            participant = ConversationParticipant(
                user_id=user_id,
                conversation_id=conversation.id
            )
            db.add(participant)
        
        await db.commit()
        await db.refresh(conversation)
        
        return conversation
    
    @staticmethod
    async def get_conversation_between_users(
        db: AsyncSession,
        user1_id: UUID,
        user2_id: UUID
    ) -> Optional[Conversation]:
        """Find existing 1-on-1 conversation between two users"""
        # Find conversations where both users are participants
        stmt = (
            select(Conversation)
            .join(ConversationParticipant)
            .where(
                and_(
                    Conversation.is_group == False,
                    ConversationParticipant.user_id.in_([user1_id, user2_id])
                )
            )
            .group_by(Conversation.id)
            .having(select(ConversationParticipant.user_id).count() == 2)
        )
        
        result = await db.execute(stmt)
        return result.scalar_one_or_none()
    
    @staticmethod
    async def send_message(
        db: AsyncSession,
        message_create: MessageCreate,
        sender_id: UUID
    ) -> Message:
        """Send a message"""
        # Find or create conversation
        conversation = await MessageService.get_conversation_between_users(
            db, sender_id, message_create.receiver_id
        )
        
        if not conversation:
            # Create new conversation
            conversation_data = ConversationCreate(
                is_group=False,
                participant_ids=[message_create.receiver_id]
            )
            conversation = await MessageService.create_conversation(
                db, conversation_data, sender_id
            )
        
        # Get sender to determine language
        sender = await db.get(User, sender_id)
        original_language = message_create.original_language or sender.preferred_language
        
        # Create message
        message = Message(
            content=message_create.content,
            original_language=original_language,
            tone=message_create.tone,
            sender_id=sender_id,
            receiver_id=message_create.receiver_id,
            conversation_id=conversation.id,
            status=MessageStatusEnum.SENT
        )
        
        db.add(message)
        
        # Update conversation timestamp
        conversation.updated_at = datetime.utcnow()
        
        # Increment unread count for receiver
        stmt = select(ConversationParticipant).where(
            and_(
                ConversationParticipant.conversation_id == conversation.id,
                ConversationParticipant.user_id == message_create.receiver_id
            )
        )
        result = await db.execute(stmt)
        participant = result.scalar_one_or_none()
        if participant:
            participant.unread_count += 1
        
        await db.commit()
        await db.refresh(message)
        
        return message
    
    @staticmethod
    async def get_conversation_messages(
        db: AsyncSession,
        conversation_id: UUID,
        user_id: UUID,
        limit: int = 50,
        offset: int = 0
    ) -> List[Message]:
        """Get messages in a conversation"""
        # Verify user is participant
        stmt = select(ConversationParticipant).where(
            and_(
                ConversationParticipant.conversation_id == conversation_id,
                ConversationParticipant.user_id == user_id
            )
        )
        result = await db.execute(stmt)
        participant = result.scalar_one_or_none()
        
        if not participant:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not a participant of this conversation"
            )
        
        # Get messages
        stmt = (
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .options(selectinload(Message.sender))
            .order_by(desc(Message.created_at))
            .limit(limit)
            .offset(offset)
        )
        
        result = await db.execute(stmt)
        messages = result.scalars().all()
        
        return list(reversed(messages))  # Return in chronological order
    
    @staticmethod
    async def get_user_conversations(
        db: AsyncSession,
        user_id: UUID
    ) -> List[Conversation]:
        """Get all conversations for a user"""
        stmt = (
            select(Conversation)
            .join(ConversationParticipant)
            .where(ConversationParticipant.user_id == user_id)
            .options(
                selectinload(Conversation.participants).selectinload(ConversationParticipant.user),
                selectinload(Conversation.messages)
            )
            .order_by(desc(Conversation.updated_at))
        )
        
        result = await db.execute(stmt)
        return result.scalars().all()
    
    @staticmethod
    async def mark_message_as_read(
        db: AsyncSession,
        message_id: UUID,
        user_id: UUID
    ) -> Message:
        """Mark a message as read"""
        message = await db.get(Message, message_id)
        
        if not message:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Message not found"
            )
        
        if message.receiver_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to mark this message as read"
            )
        
        message.status = MessageStatusEnum.READ
        message.read_at = datetime.utcnow()
        
        # Decrement unread count
        stmt = select(ConversationParticipant).where(
            and_(
                ConversationParticipant.conversation_id == message.conversation_id,
                ConversationParticipant.user_id == user_id
            )
        )
        result = await db.execute(stmt)
        participant = result.scalar_one_or_none()
        if participant and participant.unread_count > 0:
            participant.unread_count -= 1
            participant.last_read_at = datetime.utcnow()
        
        await db.commit()
        await db.refresh(message)
        
        return message
    
    @staticmethod
    async def delete_message(
        db: AsyncSession,
        message_id: UUID,
        user_id: UUID
    ) -> None:
        """Delete a message"""
        message = await db.get(Message, message_id)
        
        if not message:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Message not found"
            )
        
        if message.sender_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this message"
            )
        
        await db.delete(message)
        await db.commit()


message_service = MessageService()
