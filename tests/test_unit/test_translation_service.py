"""Tests unitaires du service de traduction.

Aucun appel réseau : httpx.AsyncClient est mocké. On vérifie surtout le contrat
de robustesse — le service ne doit jamais lever, quelle que soit la panne, car
la messagerie ne doit pas tomber avec le traducteur.
"""

from unittest.mock import AsyncMock, MagicMock, patch

import httpx
import pytest

from app.services import translation


def _mock_client(response=None, exception=None):
    """Fabrique un faux httpx.AsyncClient utilisable en context manager."""
    client = MagicMock()
    client.__aenter__ = AsyncMock(return_value=client)
    client.__aexit__ = AsyncMock(return_value=False)
    client.post = AsyncMock(side_effect=exception) if exception else AsyncMock(return_value=response)
    return client


def _groq_response(content: str):
    response = MagicMock()
    response.raise_for_status = MagicMock()
    response.json = MagicMock(return_value={"choices": [{"message": {"content": content}}]})
    return response


async def test_translate_same_language_returns_text_unchanged_without_network():
    """Même langue source et cible : retour direct, sans appel réseau."""
    with patch("app.services.translation.httpx.AsyncClient") as client_cls:
        result = await translation.translate("Bonjour", "fr", "fr", "standard")

    assert result.success is True
    assert result.translated_text == "Bonjour"
    assert result.confidence == 1.0
    client_cls.assert_not_called()


async def test_translate_without_api_key_returns_failure_with_original_text():
    """Clé absente : échec explicite portant le texte d'origine, sans exception."""
    with patch.object(translation.settings, "LLM_API_KEY", None):
        result = await translation.translate("Bonjour", "fr", "en", "standard")

    assert result.success is False
    assert result.translated_text == "Bonjour"
    assert result.error == "LLM_API_KEY is not configured"


async def test_translate_with_valid_response_returns_translated_text():
    """Réponse nominale du fournisseur : le texte traduit est extrait et nettoyé."""
    client = _mock_client(response=_groq_response("  Hello, how are you?  "))
    with patch.object(translation.settings, "LLM_API_KEY", "gsk_test"), \
         patch("app.services.translation.httpx.AsyncClient", return_value=client):
        result = await translation.translate("Bonjour", "fr", "en", "standard")

    assert result.success is True
    assert result.translated_text == "Hello, how are you?"
    assert result.source_language == "fr"
    assert result.target_language == "en"


async def test_translate_passes_tone_instruction_in_system_prompt():
    """Le registre demandé se retrouve dans l'instruction système envoyée."""
    client = _mock_client(response=_groq_response("Good day to you"))
    with patch.object(translation.settings, "LLM_API_KEY", "gsk_test"), \
         patch("app.services.translation.httpx.AsyncClient", return_value=client):
        await translation.translate("Salut", "fr", "en", "formal")

    system_prompt = client.post.await_args.kwargs["json"]["messages"][0]["content"]
    assert translation.TONE_INSTRUCTIONS["formal"] in system_prompt
    assert "French" in system_prompt and "English" in system_prompt


async def test_translate_on_network_error_returns_failure_without_raising():
    """Panne réseau : échec renvoyé, jamais propagé."""
    client = _mock_client(exception=httpx.ConnectError("connexion refusée"))
    with patch.object(translation.settings, "LLM_API_KEY", "gsk_test"), \
         patch("app.services.translation.httpx.AsyncClient", return_value=client):
        result = await translation.translate("Bonjour", "fr", "en", "standard")

    assert result.success is False
    assert result.translated_text == "Bonjour"


async def test_translate_retries_on_rate_limit_then_succeeds():
    """429 = limite de concurrence du palier gratuit, pas un échec définitif."""
    limite = MagicMock(status_code=429, text="rate limit", headers={})
    erreur = httpx.HTTPStatusError("429", request=MagicMock(), response=limite)
    refuse = MagicMock()
    refuse.raise_for_status = MagicMock(side_effect=erreur)

    client = _mock_client()
    client.post = AsyncMock(side_effect=[refuse, _groq_response("Hello")])

    with patch.object(translation.settings, "LLM_API_KEY", "k"), \
         patch("app.services.translation.httpx.AsyncClient", return_value=client), \
         patch("app.services.translation.asyncio.sleep", new=AsyncMock()):
        result = await translation.translate("Bonjour", "fr", "en", "standard")

    assert result.success is True
    assert result.translated_text == "Hello"
    assert client.post.await_count == 2


async def test_translate_gives_up_after_max_attempts_on_rate_limit():
    """Si la limite persiste, on rend la main sans jamais lever."""
    limite = MagicMock(status_code=429, text="rate limit", headers={})
    erreur = httpx.HTTPStatusError("429", request=MagicMock(), response=limite)
    refuse = MagicMock()
    refuse.raise_for_status = MagicMock(side_effect=erreur)

    client = _mock_client(response=refuse)
    with patch.object(translation.settings, "LLM_API_KEY", "k"), \
         patch("app.services.translation.httpx.AsyncClient", return_value=client), \
         patch("app.services.translation.asyncio.sleep", new=AsyncMock()):
        result = await translation.translate("Bonjour", "fr", "en", "standard")

    assert result.success is False
    assert result.error == "LLM HTTP 429"
    assert client.post.await_count == translation.MAX_ATTEMPTS


async def test_translate_does_not_retry_on_invalid_key():
    """401 est définitif : réessayer ne ferait que retarder l'échec."""
    refus = MagicMock(status_code=401, text="invalid key", headers={})
    erreur = httpx.HTTPStatusError("401", request=MagicMock(), response=refus)
    refuse = MagicMock()
    refuse.raise_for_status = MagicMock(side_effect=erreur)

    client = _mock_client(response=refuse)
    with patch.object(translation.settings, "LLM_API_KEY", "k"), \
         patch("app.services.translation.httpx.AsyncClient", return_value=client), \
         patch("app.services.translation.asyncio.sleep", new=AsyncMock()):
        result = await translation.translate("Bonjour", "fr", "en", "standard")

    assert result.success is False
    assert client.post.await_count == 1


async def test_translate_on_http_error_returns_failure_with_status_code():
    """Erreur HTTP (401 clé invalide) : échec portant le code, sans exception."""
    response = MagicMock(status_code=401, text="invalid api key", headers={})
    error = httpx.HTTPStatusError("401", request=MagicMock(), response=response)
    failing = MagicMock()
    failing.raise_for_status = MagicMock(side_effect=error)
    client = _mock_client(response=failing)

    with patch.object(translation.settings, "LLM_API_KEY", "gsk_bad"), \
         patch("app.services.translation.httpx.AsyncClient", return_value=client):
        result = await translation.translate("Bonjour", "fr", "en", "standard")

    assert result.success is False
    assert result.error == "LLM HTTP 401"


async def test_translate_on_empty_response_returns_failure():
    """Traduction vide : traitée comme un échec, pas comme un succès silencieux."""
    client = _mock_client(response=_groq_response("   "))
    with patch.object(translation.settings, "LLM_API_KEY", "gsk_test"), \
         patch("app.services.translation.httpx.AsyncClient", return_value=client):
        result = await translation.translate("Bonjour", "fr", "en", "standard")

    assert result.success is False
    assert result.error == "empty translation"


async def test_translate_accepts_enum_values_for_language_and_tone():
    """Les enums du modèle (LanguageEnum, MessageToneEnum) sont acceptés tels quels."""
    from app.models.user import LanguageEnum, MessageToneEnum

    client = _mock_client(response=_groq_response("Hello"))
    with patch.object(translation.settings, "LLM_API_KEY", "gsk_test"), \
         patch("app.services.translation.httpx.AsyncClient", return_value=client):
        result = await translation.translate(
            "Bonjour", LanguageEnum.FR, LanguageEnum.EN, MessageToneEnum.CASUAL
        )

    assert result.source_language == "fr"
    assert result.target_language == "en"
    assert result.success is True
