"""Tests unitaires de la recherche d'utilisateurs.

Sans base ni serveur : la session SQLAlchemy est mockée et on inspecte la
requête construite. Cette recherche conditionne la création de conversation —
sans elle, il faudrait connaître l'UUID de son interlocuteur.
"""

from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4

from app.services.auth import auth_service


def _db_returning(users):
    result = MagicMock()
    result.scalars.return_value.all.return_value = users
    db = MagicMock()
    db.execute = AsyncMock(return_value=result)
    return db


def _compiled(db):
    """Rend la requête SQL exécutée sous forme de texte, pour l'inspecter."""
    statement = db.execute.await_args.args[0]
    return str(statement.compile(compile_kwargs={"literal_binds": False}))


async def test_search_users_returns_matching_users_as_list():
    db = _db_returning([MagicMock(), MagicMock()])

    found = await auth_service.search_users(db, "bob", uuid4())

    assert isinstance(found, list)
    assert len(found) == 2


async def test_search_users_returns_empty_list_when_nothing_matches():
    db = _db_returning([])

    assert await auth_service.search_users(db, "zzz", uuid4()) == []


async def test_search_users_excludes_the_current_user():
    """On ne doit jamais se proposer soi-même comme interlocuteur."""
    me = uuid4()
    db = _db_returning([])

    await auth_service.search_users(db, "a", me)

    sql = _compiled(db)
    assert "users.id !=" in sql


async def test_search_users_matches_both_name_and_email():
    db = _db_returning([])

    await auth_service.search_users(db, "dupont", uuid4())

    sql = _compiled(db).lower()
    assert "full_name" in sql and "email" in sql
    assert "like" in sql  # ilike -> LIKE insensible à la casse


async def test_search_users_ignores_inactive_accounts():
    db = _db_returning([])

    await auth_service.search_users(db, "a", uuid4())

    assert "is_active" in _compiled(db)


async def test_search_users_wraps_query_in_wildcards_and_trims_it():
    """La recherche est partielle : '  bob ' doit chercher '%bob%'."""
    db = _db_returning([])

    await auth_service.search_users(db, "  bob  ", uuid4())

    params = db.execute.await_args.args[0].compile().params
    assert any(value == "%bob%" for value in params.values())


async def test_search_users_applies_a_result_limit():
    db = _db_returning([])

    await auth_service.search_users(db, "a", uuid4(), limit=5)

    assert db.execute.await_args.args[0]._limit == 5
