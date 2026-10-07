"""Configuration des tests de fumée.

Ces tests supposent une application DÉJÀ lancée. Ils échouent immédiatement
avec un message clair si rien ne répond, plutôt que de laisser chaque test
planter séparément sur une erreur de connexion illisible.

Par défaut ils visent le développement local ; pour viser la production :

    SMOKE_BASE_URL=https://multichat-app.vercel.app python -m pytest tests/test_smoke -v
"""

import os

import httpx
import pytest

# En local, le frontend (:3000) et le backend (:8000) sont deux serveurs.
# En production, la configuration `services` les place sur la même origine.
BACKEND_URL = os.environ.get("SMOKE_BASE_URL", "http://127.0.0.1:8000").rstrip("/")
FRONTEND_URL = os.environ.get(
    "SMOKE_FRONTEND_URL",
    BACKEND_URL if "SMOKE_BASE_URL" in os.environ else "http://localhost:3000",
).rstrip("/")


def _exiger(url: str, nom: str, commande: str) -> None:
    try:
        httpx.get(url, timeout=20, follow_redirects=True)
    except httpx.HTTPError as exc:
        pytest.exit(
            f"\n{nom} injoignable sur {url} ({exc.__class__.__name__}).\n"
            f"Lancez-le d'abord :  {commande}\n"
            f"Ou visez un déploiement :  SMOKE_BASE_URL=https://… python -m pytest tests/test_smoke\n",
            returncode=1,
        )


@pytest.fixture(scope="session", autouse=True)
def serveurs_joignables():
    _exiger(f"{BACKEND_URL}/health", "Le backend", "cd backend && python -m scripts.dev")
    _exiger(FRONTEND_URL, "Le frontend", "cd frontend && npm run dev")


@pytest.fixture(scope="session")
def backend() -> str:
    return BACKEND_URL


@pytest.fixture(scope="session")
def frontend() -> str:
    return FRONTEND_URL
