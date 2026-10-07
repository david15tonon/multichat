"""Test de l'indicateur de mode temps réel exposé par /health.

Sans Redis, les messages ne franchissent pas la frontière d'une instance.
En serverless, cette bascule est silencieuse : l'exposer rend le défaut
observable au lieu de se manifester par des messages qui n'arrivent pas.
"""

from unittest.mock import patch

from app.main import health_check


async def test_health_check_reports_redis_when_backplane_is_active():
    with patch("app.main.manager") as faux_manager:
        faux_manager.distributed = True
        resultat = await health_check()

    assert resultat["realtime"] == "redis"
    assert resultat["status"] == "healthy"


async def test_health_check_reports_memory_without_backplane():
    with patch("app.main.manager") as faux_manager:
        faux_manager.distributed = False
        resultat = await health_check()

    assert resultat["realtime"] == "memory"
