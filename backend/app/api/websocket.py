from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
import json

from app.websocket.manager import manager
from app.db.session import get_db
from app.core.security import security
from app.services.auth import auth_service

router = APIRouter()


@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(...),
    db: AsyncSession = Depends(get_db)
):
    """
    WebSocket endpoint for real-time messaging.
    
    **Connection:**
    ```javascript
    const ws = new WebSocket('ws://localhost:8000/ws?token=YOUR_JWT_TOKEN');
    ```
    
    **Message Types:**
    
    1. **Incoming (Client -> Server):**
    ```json
    {
        "type": "typing",
        "conversation_id": "uuid",
        "is_typing": true
    }
    ```
    
    2. **Outgoing (Server -> Client):**
    
    - New message:
    ```json
    {
        "type": "message",
        "data": {
            "id": "uuid",
            "content": "Hello!",
            "sender_id": "uuid",
            ...
        }
    }
    ```
    
    - User status:
    ```json
    {
        "type": "user_status",
        "data": {
            "user_id": "uuid",
            "is_online": true,
            "timestamp": "2024-01-01T00:00:00Z"
        }
    }
    ```
    
    - Typing indicator:
    ```json
    {
        "type": "typing",
        "data": {
            "user_id": "uuid",
            "conversation_id": "uuid",
            "is_typing": true
        }
    }
    ```
    
    - Read receipt:
    ```json
    {
        "type": "read",
        "data": {
            "user_id": "uuid",
            "message_id": "uuid",
            "read_at": "2024-01-01T00:00:00Z"
        }
    }
    ```
    """
    # Authenticate user from token
    try:
        payload = security.decode_token(token)
        user_id = UUID(payload.get("sub"))
        
        # Verify user exists
        user = await auth_service.get_user_by_id(db, user_id)
        if not user:
            await websocket.close(code=1008, reason="User not found")
            return
        
    except Exception as e:
        await websocket.close(code=1008, reason="Invalid token")
        return
    
    # Connect user
    await manager.connect(websocket, user_id)
    
    # Update user status in database
    await auth_service.update_user_status(db, user_id, is_online=True)
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            message_type = message_data.get("type")
            
            if message_type == "typing":
                # Handle typing indicator
                conversation_id = UUID(message_data.get("conversation_id"))
                is_typing = message_data.get("is_typing", False)
                
                await manager.broadcast_typing_indicator(
                    user_id,
                    conversation_id,
                    is_typing
                )
            
            elif message_type == "read":
                # Handle read receipt
                message_id = UUID(message_data.get("message_id"))
                conversation_id = UUID(message_data.get("conversation_id"))
                
                await manager.broadcast_read_receipt(
                    user_id,
                    message_id,
                    conversation_id
                )
            
            elif message_type == "ping":
                # Heartbeat
                await websocket.send_json({"type": "pong"})
            
            else:
                # Unknown message type
                await websocket.send_json({
                    "type": "error",
                    "message": f"Unknown message type: {message_type}"
                })
    
    except WebSocketDisconnect:
        # Handle disconnect
        manager.disconnect(websocket, user_id)
        await auth_service.update_user_status(db, user_id, is_online=False)
    
    except Exception as e:
        # Handle other errors
        print(f"WebSocket error: {str(e)}")
        manager.disconnect(websocket, user_id)
        await auth_service.update_user_status(db, user_id, is_online=False)
