from pydantic_settings import BaseSettings
from typing import Optional
from functools import lru_cache


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "MultiChat API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api"

    # Security
    SECRET_KEY: str = "your-super-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database
    # SQLite par défaut : aucune infrastructure ni secret requis pour démarrer.
    # Pour Postgres, décommenter asyncpg dans requirements.txt et surcharger
    # DATABASE_URL (les options de pool ci-dessous ne s'appliquent qu'à lui).
    DATABASE_URL: str = "sqlite+aiosqlite:///./multichat.db"
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 10

    # CORS
    BACKEND_CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "https://multichat.vercel.app",
    ]

    # Traduction — n'importe quelle API compatible OpenAI (chat/completions).
    # Le fournisseur se change dans .env, sans toucher au code. Voir
    # .env.example pour les réglages prêts à l'emploi (Z.ai, Qwen, Groq).
    LLM_API_KEY: Optional[str] = None
    LLM_BASE_URL: str = "https://api.z.ai/api/paas/v4"
    LLM_MODEL: str = "glm-4.5-flash"

    # Logging
    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


settings = get_settings()
