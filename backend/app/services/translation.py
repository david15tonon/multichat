"""Service de traduction adossé à une API compatible OpenAI.

Remplace le module `mbart_translator`, dans lequel le registre était simulé en
préfixant le texte source ("Hey, " / "Dear sir/madam, ") avant traduction puis
en tentant de retirer ce préfixe du *résultat traduit*. Le préfixe étant lui
aussi traduit, le retrait échouait et le texte parasite ressortait dans le
message. Ici, un seul appel traite la langue ET le registre : le problème
disparaît par construction.

Principe de robustesse : la messagerie ne doit jamais tomber avec le
traducteur. Clé absente, panne réseau ou réponse inattendue renvoient un
résultat `success=False` portant le texte d'origine, jamais une exception.
"""

from __future__ import annotations

import asyncio
import logging
from dataclasses import dataclass
from typing import Optional

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

# Noms explicites : un LLM traduit mieux depuis "français" que depuis "fr".
LANGUAGE_NAMES = {
    "fr": "French",
    "en": "English",
    "es": "Spanish",
    "de": "German",
    "it": "Italian",
    "pt": "Portuguese",
    "zh": "Chinese (Simplified)",
    "ja": "Japanese",
    "ar": "Arabic",
}

TONE_INSTRUCTIONS = {
    "casual": "Use a casual, friendly register, as between friends. Contractions and informal address are welcome.",
    "standard": "Use a neutral, everyday register: polite but not stiff.",
    "formal": "Use a formal, respectful register, as in professional correspondence.",
}

REQUEST_TIMEOUT = 20.0

# Les paliers gratuits limitent souvent la concurrence (Z.ai : 1 requête à la
# fois). Un 429 n'est pas une erreur définitive : on retente brièvement plutôt
# que de livrer un message non traduit.
MAX_ATTEMPTS = 3
RETRY_STATUSES = {429, 500, 502, 503, 504}
RETRY_BASE_DELAY = 1.0


@dataclass
class TranslationResult:
    """Résultat d'une traduction, succès comme échec."""

    translated_text: str
    source_language: str
    target_language: str
    confidence: float
    success: bool
    error: Optional[str] = None


def _enum_value(value) -> str:
    """Accepte indifféremment une str ou un Enum (LanguageEnum, Tone...)."""
    return value.value if hasattr(value, "value") else str(value)


def _build_prompt(source_name: str, target_name: str, tone: str) -> str:
    tone_instruction = TONE_INSTRUCTIONS.get(tone, TONE_INSTRUCTIONS["standard"])
    return (
        f"You are a translation engine. Translate the user's message from "
        f"{source_name} to {target_name}. {tone_instruction} "
        "Return ONLY the translated text: no quotes, no commentary, no "
        "explanation, no original text."
    )


async def translate(
    text: str,
    source_language,
    target_language,
    tone="standard",
) -> TranslationResult:
    """Traduit `text` en adaptant le registre. Ne lève jamais d'exception."""
    source = _enum_value(source_language)
    target = _enum_value(target_language)
    tone_value = _enum_value(tone)

    def failure(error: str) -> TranslationResult:
        return TranslationResult(
            translated_text=text,
            source_language=source,
            target_language=target,
            confidence=0.0,
            success=False,
            error=error,
        )

    # Même langue : rien à faire, et surtout pas d'appel réseau.
    if source == target:
        return TranslationResult(
            translated_text=text,
            source_language=source,
            target_language=target,
            confidence=1.0,
            success=True,
        )

    if not settings.LLM_API_KEY:
        logger.warning(
            "LLM_API_KEY absente : message délivré non traduit (%s -> %s).",
            source,
            target,
        )
        return failure("LLM_API_KEY is not configured")

    payload = {
        "model": settings.LLM_MODEL,
        "messages": [
            {
                "role": "system",
                "content": _build_prompt(
                    LANGUAGE_NAMES.get(source, source),
                    LANGUAGE_NAMES.get(target, target),
                    tone_value,
                ),
            },
            {"role": "user", "content": text},
        ],
        "temperature": 0.3,
    }

    last_error = "unknown error"

    async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
        for attempt in range(1, MAX_ATTEMPTS + 1):
            try:
                response = await client.post(
                    f"{settings.LLM_BASE_URL}/chat/completions",
                    json=payload,
                    headers={"Authorization": f"Bearer {settings.LLM_API_KEY}"},
                )
                response.raise_for_status()
                translated = response.json()["choices"][0]["message"]["content"].strip()
                break
            except httpx.HTTPStatusError as exc:
                status = exc.response.status_code
                last_error = f"LLM HTTP {status}"
                if status not in RETRY_STATUSES or attempt == MAX_ATTEMPTS:
                    logger.warning(
                        "Le fournisseur a répondu %s pour %s -> %s : %s",
                        status, source, target, exc.response.text[:200],
                    )
                    return failure(last_error)
                # `Retry-After` prime sur notre temporisation quand il est fourni.
                delay = RETRY_BASE_DELAY * attempt
                header = exc.response.headers.get("Retry-After")
                if header:
                    try:
                        delay = max(delay, float(header))
                    except ValueError:
                        pass
                logger.info(
                    "Fournisseur %s (tentative %s/%s), nouvelle tentative dans %.1fs",
                    status, attempt, MAX_ATTEMPTS, delay,
                )
                await asyncio.sleep(delay)
            except (httpx.HTTPError, KeyError, IndexError, ValueError) as exc:
                last_error = str(exc) or exc.__class__.__name__
                if attempt == MAX_ATTEMPTS:
                    logger.warning(
                        "Échec de traduction %s -> %s : %s", source, target, last_error
                    )
                    return failure(last_error)
                await asyncio.sleep(RETRY_BASE_DELAY * attempt)
        else:
            return failure(last_error)

    if not translated:
        logger.warning("Le fournisseur a renvoyé une traduction vide (%s -> %s).", source, target)
        return failure("empty translation")

    return TranslationResult(
        translated_text=translated,
        source_language=source,
        target_language=target,
        confidence=1.0,
        success=True,
    )


async def translate_request(request) -> TranslationResult:
    """Adaptateur pour le schéma `TranslationRequest` de l'API."""
    return await translate(
        text=request.text,
        source_language=request.source_language,
        target_language=request.target_language,
        tone=request.tone,
    )
