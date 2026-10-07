from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base
from typing import AsyncGenerator
from app.core.config import settings

# SQLite n'utilise pas QueuePool : lui passer pool_size/max_overflow lève
# "TypeError: Invalid argument(s) sent to create_engine()". Ces options ne
# valent que pour les backends réseau (Postgres, MySQL).
_engine_options: dict = {"echo": settings.DEBUG}
if not settings.DATABASE_URL.startswith("sqlite"):
    _engine_options.update(
        pool_size=settings.DATABASE_POOL_SIZE,
        max_overflow=settings.DATABASE_MAX_OVERFLOW,
        pool_pre_ping=True,
    )

# Create async engine
engine = create_async_engine(settings.DATABASE_URL, **_engine_options)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# Base class for models
Base = declarative_base()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency function to get database session.
    Usage:
        @app.get("/users")
        async def get_users(db: AsyncSession = Depends(get_db)):
            ...
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """Initialize database tables"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def close_db() -> None:
    """Close database connection"""
    await engine.dispose()


async def reset_presence() -> None:
    """Remet tous les utilisateurs hors ligne.

    Appelé au démarrage : les sessions WebSocket ne survivent pas au processus,
    donc toute présence héritée du run précédent est fausse.
    """
    from sqlalchemy import update

    from app.models.user import User

    async with AsyncSessionLocal() as session:
        await session.execute(update(User).values(is_online=False))
        await session.commit()
