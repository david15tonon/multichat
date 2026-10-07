"""Fumée côté API : le service répond-il correctement de bout en bout ?

Ces tests ne créent aucun compte : ils vérifient que les routes existent et
renvoient le bon code, pas la logique métier (couverte par les unitaires).
"""

import httpx
import pytest


def test_health_returns_healthy_status(backend):
    reponse = httpx.get(f"{backend}/health", timeout=30)

    assert reponse.status_code == 200
    assert reponse.json()["status"] == "healthy"


def test_health_reports_the_realtime_mode(backend):
    """« memory » en production signale une diffusion qui ne franchit pas
    la frontière d'une instance : les messages n'arriveraient pas."""
    corps = httpx.get(f"{backend}/health", timeout=30).json()

    assert corps["realtime"] in {"redis", "memory"}


def test_openapi_documentation_is_served(backend):
    assert httpx.get(f"{backend}/docs", timeout=30).status_code == 200


@pytest.mark.parametrize(
    "chemin",
    [
        "/api/auth/me",
        "/api/messages/conversations",
        "/api/settings/me",
        "/api/auth/users/search?q=test",
    ],
)
def test_protected_routes_answer_401_not_500(backend, chemin):
    """Un 500 trahirait une route cassée ; un 200 une route non protégée.

    C'est exactement ce qui est arrivé en production : le backend absent,
    la rewrite SPA renvoyait du HTML en 200 sur /api/*.
    """
    reponse = httpx.get(f"{backend}{chemin}", timeout=30)

    assert reponse.status_code in (401, 403), (
        f"{chemin} a répondu {reponse.status_code} : "
        f"{reponse.text[:120]}"
    )


def test_api_routes_return_json_not_html(backend):
    """Garde-fou contre une rewrite qui avalerait /api/* vers l'index."""
    reponse = httpx.get(f"{backend}/api/auth/me", timeout=30)

    assert "html" not in reponse.headers.get("content-type", "").lower()


def test_unknown_api_route_returns_404(backend):
    assert httpx.get(f"{backend}/api/nexistepas", timeout=30).status_code == 404
