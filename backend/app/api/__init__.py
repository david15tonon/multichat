from fastapi import APIRouter
from app.api import auth, messages, settings, websocket

api_router = APIRouter()

# Include all routers
api_router.include_router(auth.router)
api_router.include_router(messages.router)
api_router.include_router(settings.router)
api_router.include_router(websocket.router)
