from fastapi import FastAPI, HTTPException  # ⬅️ AJOUT: HTTPException pour translate_endpoint
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from app.core.config import settings
from app.api import api_router
from app.db.session import init_db, close_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.
    """
    # Startup
    print("🚀 Starting MultiChat API...")
    await init_db()
    print("✅ Database initialized")
    
    yield
    
    # Shutdown
    print("👋 Shutting down MultiChat API...")
    await close_db()
    print("✅ Database connections closed")


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
    ## MultiChat API 🌐💬
    
    **Real-time multilingual messaging platform with automatic translation.**
    
    ### Features:
    
    - 🔐 **Authentication**: JWT-based auth with access/refresh tokens
    - 💬 **Real-time Messaging**: WebSocket support for instant delivery
    - 🌍 **Automatic Translation**: Messages translated to receiver's language
    - 🎭 **Tone Adaptation**: Casual, Standard, or Formal message tones
    - 👥 **Conversations**: 1-on-1 and group chats
    - 📊 **Read Receipts**: Message delivery and read status
    - ⚡ **Typing Indicators**: Real-time typing notifications
    - 🌐 **9+ Languages**: FR, EN, ES, DE, IT, PT, ZH, JA, AR
    
    ### Quick Start:
    
    1. **Register**: `POST /api/auth/register`
    2. **Login**: `POST /api/auth/login` (get JWT token)
    3. **Connect WebSocket**: `ws://localhost:8000/ws?token=YOUR_TOKEN`
    4. **Send Messages**: `POST /api/v1/messages/send`
    
    ### Authentication:
    
    Most endpoints require authentication. Include the JWT token in the Authorization header:
    ```
    Authorization: Bearer YOUR_ACCESS_TOKEN
    ```
    """,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include API router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint - API health check
    """
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs",
        "health": "/health"
    }

# ⬇️ SUPPRESSION: On ne importe plus au niveau module
# from app.services.mbart_translator import MBartTranslator

# Variable globale pour le traducteur
translator_instance = None
@app.post("/translate")
async def translate_endpoint(
    text: str, 
    source: str, 
    target: str, 
    tone: str = "standard"
):
    """
    Traduction via l'API Hugging Face (instantané, sans chargement)
    """
    translator = await MBartTranslator.get_instance()
    result = await translator.translate(text, source, target, tone)
    return result

@app.get("/translate/status")
async def translation_status():
    """Vérifie que l'API est configurée"""
    has_token = bool(os.environ.get("HF_TOKEN"))
    return {
        "status": "ready" if has_token else "missing_token",
        "message": "Utilise l'API Hugging Face - aucun modèle chargé localement"
    }# ⬇️ AJOUT: Endpoint /kaithheathcheck OBLIGATOIRE pour Leapcell
@app.get("/kaithheathcheck")
async def kaith_heathcheck():
    """Healthcheck requis par Leapcell - doit répondre immédiatement"""
    return {"status": "healthy"}

# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint for monitoring
    """
    return {
        "status": "healthy",
        "version": settings.APP_VERSION
    }


# Custom exception handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    """Handle 404 errors"""
    return JSONResponse(
        status_code=404,
        content={
            "detail": "Endpoint not found",
            "path": str(request.url)
        }
    )


@app.exception_handler(500)
async def internal_error_handler(request, exc):
    """Handle 500 errors"""
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "message": str(exc) if settings.DEBUG else "An error occurred"
        }
    )


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8080,  # Port 8080 pour Leapcell
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )
