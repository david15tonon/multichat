from typing import Dict, Set
from fastapi import WebSocket, WebSocketDisconnect
from uuid import UUID
import json
import asyncio
from datetime import datetime


class ConnectionManager:
    """Manage WebSocket connections"""
    
    def __init__(self):
        # user_id -> set of WebSocket connections
        self.active_connections: Dict[UUID, Set[WebSocket]] = {}
        # conversation_id -> set of user_ids
        self.conversation_participants: Dict[UUID, Set[UUID]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: UUID):
        """Connect a user"""
        await websocket.accept()
        
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        
        self.active_connections[user_id].add(websocket)
        
        # Notify others that user is online
        await self.broadcast_user_status(user_id, is_online=True)
    
    def disconnect(self, websocket: WebSocket, user_id: UUID):
        """Disconnect a user"""
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            
            # Remove user entry if no more connections
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
                
                # Notify others that user is offline
                asyncio.create_task(
                    self.broadcast_user_status(user_id, is_online=False)
                )
    
    def is_user_online(self, user_id: UUID) -> bool:
        """Check if user is online"""
        return user_id in self.active_connections and len(self.active_connections[user_id]) > 0
    
    async def send_personal_message(self, message: dict, user_id: UUID):
        """Send message to a specific user (all their connections)"""
        if user_id in self.active_connections:
            disconnected = set()
            
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    disconnected.add(connection)
            
            # Clean up disconnected connections
            for conn in disconnected:
                self.active_connections[user_id].discard(conn)
    
    async def send_to_conversation(
        self,
        message: dict,
        conversation_id: UUID,
        exclude_user: UUID = None
    ):
        """Send message to all participants in a conversation"""
        if conversation_id in self.conversation_participants:
            for user_id in self.conversation_participants[conversation_id]:
                if exclude_user and user_id == exclude_user:
                    continue
                
                await self.send_personal_message(message, user_id)
    
    def join_conversation(self, user_id: UUID, conversation_id: UUID):
        """Add user to conversation room"""
        if conversation_id not in self.conversation_participants:
            self.conversation_participants[conversation_id] = set()
        
        self.conversation_participants[conversation_id].add(user_id)
    
    def leave_conversation(self, user_id: UUID, conversation_id: UUID):
        """Remove user from conversation room"""
        if conversation_id in self.conversation_participants:
            self.conversation_participants[conversation_id].discard(user_id)
            
            # Clean up empty conversation rooms
            if not self.conversation_participants[conversation_id]:
                del self.conversation_participants[conversation_id]
    
    async def broadcast_user_status(self, user_id: UUID, is_online: bool):
        """Broadcast user online/offline status to all connected users"""
        status_message = {
            "type": "user_status",
            "data": {
                "user_id": str(user_id),
                "is_online": is_online,
                "timestamp": datetime.utcnow().isoformat()
            }
        }
        
        # Send to all connected users
        for uid in list(self.active_connections.keys()):
            await self.send_personal_message(status_message, uid)
    
    async def broadcast_typing_indicator(
        self,
        user_id: UUID,
        conversation_id: UUID,
        is_typing: bool
    ):
        """Broadcast typing indicator to conversation participants"""
        typing_message = {
            "type": "typing",
            "data": {
                "user_id": str(user_id),
                "conversation_id": str(conversation_id),
                "is_typing": is_typing,
                "timestamp": datetime.utcnow().isoformat()
            }
        }
        
        await self.send_to_conversation(
            typing_message,
            conversation_id,
            exclude_user=user_id
        )
    
    async def broadcast_read_receipt(
        self,
        user_id: UUID,
        message_id: UUID,
        conversation_id: UUID
    ):
        """Broadcast read receipt to conversation participants"""
        read_message = {
            "type": "read",
            "data": {
                "user_id": str(user_id),
                "message_id": str(message_id),
                "conversation_id": str(conversation_id),
                "read_at": datetime.utcnow().isoformat()
            }
        }
        
        await self.send_to_conversation(
            read_message,
            conversation_id,
            exclude_user=user_id
        )
    
    async def broadcast_message(
        self,
        message_data: dict,
        conversation_id: UUID,
        sender_id: UUID
    ):
        """Broadcast new message to conversation participants"""
        message = {
            "type": "message",
            "data": message_data
        }
        
        await self.send_to_conversation(
            message,
            conversation_id,
            exclude_user=None  # Send to all including sender (for multi-device)
        )


# Global connection manager instance
manager = ConnectionManager()
