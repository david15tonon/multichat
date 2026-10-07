"""Crée des comptes de test pour essayer l'application à deux.

Idempotent : relancer le script ne crée pas de doublons, il signale
simplement les comptes déjà présents.

    python -m scripts.seed
"""

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.db.session import AsyncSessionLocal, init_db  # noqa: E402
from app.schemas.user import UserCreate  # noqa: E402
from app.services.auth import auth_service  # noqa: E402

PASSWORD = "Password1"

TEST_USERS = [
    {
        "email": "elena@multichat.dev",
        "full_name": "Elena Rossi",
        "preferred_language": "en",
        "preferred_tone": "standard",
    },
    {
        "email": "kenji@multichat.dev",
        "full_name": "Kenji Tanaka",
        "preferred_language": "ja",
        "preferred_tone": "formal",
    },
    {
        "email": "carla@multichat.dev",
        "full_name": "Carla Gómez",
        "preferred_language": "es",
        "preferred_tone": "casual",
    },
]


async def seed() -> None:
    await init_db()

    async with AsyncSessionLocal() as db:
        for spec in TEST_USERS:
            existing = await auth_service.get_user_by_email(db, spec["email"])
            if existing:
                print(f"  = {spec['full_name']:<14} {spec['email']:<26} (déjà présent)")
                continue

            await auth_service.create_user(
                db, UserCreate(password=PASSWORD, **spec)
            )
            print(f"  + {spec['full_name']:<14} {spec['email']:<26} créé")

    print(f"\nMot de passe commun : {PASSWORD}")
    print("Cherchez ces personnes par leur nom ou leur e-mail depuis l'inbox.")


if __name__ == "__main__":
    asyncio.run(seed())
