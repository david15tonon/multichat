"""Tests de la normalisation de l'URL de base de données.

Les hébergeurs fournissent des URL `postgres://` ou `postgresql://`, que
SQLAlchemy résout vers psycopg2 — un pilote synchrone, incompatible avec
`create_async_engine`. Sans normalisation, le serveur ne démarre pas en
production alors qu'il fonctionne en local.
"""

import pytest

from app.core.config import _normalize_database_url


@pytest.mark.parametrize(
    "fourni,attendu",
    [
        # Forme historique de Heroku, encore émise par plusieurs hébergeurs
        ("postgres://u:p@h/db", "postgresql+asyncpg://u:p@h/db"),
        # Forme standard de Neon et Supabase
        ("postgresql://u:p@h/db", "postgresql+asyncpg://u:p@h/db"),
        ("sqlite:///./multichat.db", "sqlite+aiosqlite:///./multichat.db"),
    ],
)
def test_normalize_database_url_forces_async_driver(fourni, attendu):
    assert _normalize_database_url(fourni) == attendu


@pytest.mark.parametrize(
    "deja_explicite",
    [
        "postgresql+asyncpg://u:p@h/db",
        "sqlite+aiosqlite:///./multichat.db",
        "postgresql+psycopg://u:p@h/db",
    ],
)
def test_normalize_database_url_respects_an_explicit_driver(deja_explicite):
    """Un pilote déjà choisi n'est jamais remplacé, fût-il synchrone."""
    assert _normalize_database_url(deja_explicite) == deja_explicite


def test_normalize_database_url_preserves_query_parameters():
    """Neon ajoute ?sslmode=require : le perdre casserait la connexion."""
    url = "postgresql://u:p@h/db?sslmode=require&channel_binding=require"

    assert _normalize_database_url(url) == (
        "postgresql+asyncpg://u:p@h/db?sslmode=require&channel_binding=require"
    )


def test_normalize_database_url_leaves_unknown_schemes_untouched():
    assert _normalize_database_url("mysql+aiomysql://u:p@h/db") == "mysql+aiomysql://u:p@h/db"
