"""Fumée côté interface : l'application monte-t-elle réellement ?

Un build peut être servi en HTTP 200 tout en étant inutilisable : chunk
manquant, erreur au montage, variable d'environnement figée sur une adresse
locale. Ces tests regardent ce que le navigateur obtient vraiment.
"""

import pytest
from playwright.sync_api import sync_playwright


@pytest.fixture(scope="module")
def page_factory():
    with sync_playwright() as pw:
        navigateur = pw.chromium.launch()
        yield navigateur
        navigateur.close()


def _ouvrir(navigateur, url):
    """Ouvre une page en collectant erreurs JS et requêtes en échec."""
    contexte = navigateur.new_context(viewport={"width": 1280, "height": 800})
    page = contexte.new_page()
    erreurs, echecs = [], []
    page.on("pageerror", lambda e: erreurs.append(str(e)))
    page.on("console", lambda m: erreurs.append(m.text) if m.type == "error" else None)
    page.on("requestfailed", lambda r: echecs.append(r.url))
    page.goto(url, wait_until="networkidle", timeout=60000)
    page.wait_for_timeout(2500)
    return page, erreurs, echecs


def test_login_page_actually_mounts(page_factory, frontend):
    page, erreurs, _ = _ouvrir(page_factory, f"{frontend}/login")

    assert page.locator("input[type=email]").count() == 1
    assert page.locator("input[type=password]").count() == 1
    assert page.locator("button[type=submit]").count() >= 1
    assert [e for e in erreurs if "favicon" not in e.lower()] == []


def test_no_asset_fails_to_load(page_factory, frontend):
    """Un chunk en 404 laisse une page blanche sans erreur HTTP visible."""
    _, _, echecs = _ouvrir(page_factory, f"{frontend}/login")

    assert [u for u in echecs if "favicon" not in u.lower()] == []


def test_signup_page_is_reachable(page_factory, frontend):
    """Cette page a longtemps existé sans être atteignable."""
    page, _, _ = _ouvrir(page_factory, f"{frontend}/signup")

    assert "/signup" in page.url
    assert page.locator("input[type=password]").count() == 2


def test_forgot_password_page_is_reachable(page_factory, frontend):
    page, _, _ = _ouvrir(page_factory, f"{frontend}/forgot-password")

    assert "/forgot-password" in page.url


def test_protected_route_redirects_to_login(page_factory, frontend):
    page, _, _ = _ouvrir(page_factory, f"{frontend}/conversations")

    assert "/login" in page.url


def test_unknown_route_shows_the_404_page(page_factory, frontend):
    page, _, _ = _ouvrir(page_factory, f"{frontend}/cette-page-nexiste-pas")

    assert "404" in page.locator("body").inner_text()


def test_bundle_does_not_target_a_local_backend(page_factory, frontend):
    """Régression : un .env local embarqué dans le build faisait appeler
    127.0.0.1 depuis le site public."""
    page, _, _ = _ouvrir(page_factory, f"{frontend}/login")
    appels = page.evaluate(
        "() => performance.getEntriesByType('resource').map(r => r.name).join(' ')"
    )

    assert "127.0.0.1" not in appels and "localhost:8000" not in appels
