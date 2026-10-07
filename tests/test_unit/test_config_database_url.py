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


def test_normalize_database_url_drops_libpq_only_parameters():
    """Régression : `channel_binding` faisait planter le démarrage en production.

    Neon ajoute `sslmode` et `channel_binding`, qui sont des paramètres libpq.
    asyncpg ne les connaît pas et lève
    `TypeError: connect() got an unexpected keyword argument`.
    """
    url = "postgresql://u:p@h/db?sslmode=require&channel_binding=require"

    assert _normalize_database_url(url) == "postgresql+asyncpg://u:p@h/db?ssl=require"


def test_normalize_database_url_translates_sslmode_to_ssl():
    """`sslmode` est la syntaxe psycopg2 ; asyncpg attend `ssl`."""
    assert (
        _normalize_database_url("postgresql://u:p@h/db?sslmode=disable")
        == "postgresql+asyncpg://u:p@h/db?ssl=disable"
    )


def test_normalize_database_url_keeps_parameters_asyncpg_understands():
    assert (
        _normalize_database_url("postgresql://u:p@h/db?application_name=multichat")
        == "postgresql+asyncpg://u:p@h/db?application_name=multichat"
    )


def test_normalize_database_url_preserves_sqlite_triple_slash():
    """`urlunsplit` écrase le triple slash : SQLite est traité à part."""
    assert _normalize_database_url("sqlite:///./multichat.db") == (
        "sqlite+aiosqlite:///./multichat.db"
    )


def test_normalize_database_url_leaves_unknown_schemes_untouched():
    assert _normalize_database_url("mysql+aiomysql://u:p@h/db") == "mysql+aiomysql://u:p@h/db"
