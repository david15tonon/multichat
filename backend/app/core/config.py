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

    # Redis — relais de diffusion entre instances (serverless). Vide, le
    # gestionnaire de connexions retombe en mémoire, ce qui convient en
    # développement local mais pas à plusieurs instances.
    REDIS_URL: Optional[str] = None

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


def _normalize_database_url(url: str) -> str:
    """Rend une URL d'hébergeur utilisable par SQLAlchemy en mode asynchrone.

    Deux corrections, toutes deux nécessaires en production :

    1. Le pilote. Les hébergeurs émettent `postgres://` ou `postgresql://`,
       que SQLAlchemy résout vers psycopg2 — synchrone, donc incompatible
       avec `create_async_engine`.

    2. Les paramètres libpq. Neon ajoute `sslmode` et `channel_binding`, que
       asyncpg ne connaît pas : il lève
       `TypeError: connect() got an unexpected keyword argument`. On traduit
       `sslmode` en `ssl`, que asyncpg comprend, et on écarte le reste.
    """
    from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

    # SQLite est traité à part : `urlunsplit` écrase le triple slash de
    # `sqlite:///./fichier.db`, et aucun paramètre libpq ne s'y applique.
    if url.startswith("sqlite+"):
        return url
    if url.startswith("sqlite://"):
        return url.replace("sqlite://", "sqlite+aiosqlite://", 1)

    parts = urlsplit(url)
    scheme = parts.scheme

    if "+" not in scheme:
        if scheme == "postgres":
            scheme = "postgresql+asyncpg"
        elif scheme == "postgresql":
            scheme = "postgresql+asyncpg"

    if not scheme.startswith("postgresql+asyncpg"):
        return urlunsplit((scheme, parts.netloc, parts.path, parts.query, parts.fragment))

    # Paramètres propres à libpq, inconnus d'asyncpg.
    LIBPQ_SEULEMENT = {"channel_binding", "options", "target_session_attrs", "gssencmode"}
    retenus = []
    for cle, valeur in parse_qsl(parts.query, keep_blank_values=True):
        if cle in LIBPQ_SEULEMENT:
            continue
        if cle == "sslmode":
            # `disable` est le seul mode où asyncpg veut explicitement rien.
            retenus.append(("ssl", "disable" if valeur == "disable" else "require"))
            continue
        retenus.append((cle, valeur))

    return urlunsplit((scheme, parts.netloc, parts.path, urlencode(retenus), parts.fragment))


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    settings = Settings()
    settings.DATABASE_URL = _normalize_database_url(settings.DATABASE_URL)
    return settings


settings = get_settings()
