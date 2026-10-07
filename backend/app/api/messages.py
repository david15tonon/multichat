import logging

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from app.db.session import get_db
from app.schemas.message import (
    MessageCreate,
    MessagePublic,
    ConversationCreate,
    ConversationPublic,
    ConversationWithMessages
)
from app.services.message import message_service
# ⬇️ SUPPRESSION: Import bloquant au niveau module
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.message import TranslationStatusEnum
from app.websocket.manager import manager

router = APIRouter(prefix="/messages", tags=["Messages"])

logger = logging.getLogger(__name__)


@router.post("/conversations", response_model=ConversationPublic, status_code=status.HTTP_201_CREATED)
async def create_conversation(
    conversation_create: ConversationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new conversation."""
    conversation = await message_service.create_conversation(
        db,
        conversation_create,
        current_user.id
    )
    
    # Join WebSocket room for real-time updates
    await manager.join_conversation(current_user.id, conversation.id)
    for participant_id in conversation_create.participant_ids:
        await manager.join_conversation(participant_id, conversation.id)

    # `Conversation.participants` contient des ConversationParticipant, pas des
    # User : on construit la réponse explicitement, comme GET /conversations.
    return ConversationPublic(
        id=conversation.id,
        is_group=conversation.is_group,
        name=conversation.name,
        participants=[
            p.user for p in conversation.participants if p.user.id != current_user.id
        ],
        last_message=conversation.messages[-1] if conversation.messages else None,
        unread_count=next(
            (p.unread_count for p in conversation.participants if p.user_id == current_user.id),
            0,
        ),
        created_at=conversation.created_at,
        updated_at=conversation.updated_at,
    )


@router.get("/conversations", response_model=List[ConversationPublic])
async def get_conversations(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all conversations for the current user."""
    conversations = await message_service.get_user_conversations(db, current_user.id)
    
    # Transform to ConversationPublic schema
    result = []
    for conv in conversations:
        # Get participants
        participants = [p.user for p in conv.participants if p.user.id != current_user.id]
        
        # Get last message
        last_message = conv.messages[-1] if conv.messages else None
        
        # Get unread count for current user
        unread = next(
            (p.unread_count for p in conv.participants if p.user_id == current_user.id),
            0
        )
        
        result.append(ConversationPublic(
            id=conv.id,
            is_group=conv.is_group,
            name=conv.name,
            participants=participants,
            last_message=last_message,
            unread_count=unread,
            created_at=conv.created_at,
            updated_at=conv.updated_at
        ))
    
    return result


@router.get("/conversations/{conversation_id}", response_model=ConversationWithMessages)
async def get_conversation_with_messages(
    conversation_id: str,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific conversation with its messages."""
    conv_id = UUID(conversation_id)
    
    # Get messages
    messages = await message_service.get_conversation_messages(
        db,
        conv_id,
        current_user.id,
        limit,
        offset
    )
    
    # Get conversation details
    conversations = await message_service.get_user_conversations(db, current_user.id)
    conversation = next((c for c in conversations if c.id == conv_id), None)
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    return ConversationWithMessages(
        id=conversation.id,
        is_group=conversation.is_group,
        name=conversation.name,
        participants=[p.user for p in conversation.participants],
        messages=messages,
        created_at=conversation.created_at,
        updated_at=conversation.updated_at
    )


@router.post("/send", response_model=MessagePublic, status_code=status.HTTP_201_CREATED)
async def send_message(
    message_create: MessageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Send a message to another user.
    Message will be automatically translated to receiver's preferred language.
    """
    # Send message
    message = await message_service.send_message(db, message_create, current_user.id)
    
    # Get receiver to determine target language
    from app.services.auth import auth_service
    receiver = await auth_service.get_user_by_id(db, message_create.receiver_id)
    
    # Translate message if languages differ
    if receiver and receiver.preferred_language != message.original_language:
        from app.services import translation as translation_service

        # translate() ne lève jamais : elle renvoie un résultat portant le texte
        # d'origine en cas d'échec. Le message part donc dans tous les cas.
        result = await translation_service.translate(
            text=message.content,
            source_language=message.original_language,
            target_language=receiver.preferred_language,
            tone=message.tone,
        )

        if result.success:
            message.translated_content = result.translated_text
            message.target_language = receiver.preferred_language
            message.translation_status = TranslationStatusEnum.TRANSLATED
        else:
            logger.warning(
                "Traduction indisponible pour le message %s : %s",
                message.id,
                result.error,
            )
            message.translation_status = TranslationStatusEnum.FAILED

        await db.commit()
        await db.refresh(message)
    
    # Broadcast message via WebSocket
    # Même forme que MessagePublic : un client qui sait lire la réponse REST
    # doit pouvoir lire la diffusion temps réel sans cas particulier. Les
    # champs de langue et de ton manquaient, ce qui faisait planter l'UI.
    message_data = {
        "id": str(message.id),
        "content": message.content,
        "original_language": message.original_language.value,
        "translated_content": message.translated_content,
        "target_language": message.target_language.value if message.target_language else None,
        "tone": message.tone.value,
        "status": message.status.value,
        "translation_status": (
            message.translation_status.value if message.translation_status else None
        ),
        "sender_id": str(message.sender_id),
        "receiver_id": str(message.receiver_id),
        "conversation_id": str(message.conversation_id),
        "created_at": message.created_at.isoformat(),
        "read_at": message.read_at.isoformat() if message.read_at else None,
    }
    
    await manager.broadcast_message(
        message_data,
        message.conversation_id,
        current_user.id
    )
    
    return message


@router.post("/messages/{message_id}/read", response_model=MessagePublic)
async def mark_message_read(
    message_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a message as read."""
    msg_id = UUID(message_id)
    message = await message_service.mark_message_as_read(db, msg_id, current_user.id)
    
    # Broadcast read receipt
    await manager.broadcast_read_receipt(
        current_user.id,
        msg_id,
        message.conversation_id
    )
    
    return message


@router.delete("/messages/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_message(
    message_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a message."""
    await message_service.delete_message(db, UUID(message_id), current_user.id)
    return None
