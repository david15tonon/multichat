import os
import asyncio
from typing import Optional, Dict, List, Union
from huggingface_hub import InferenceClient
from .config import Language, Tone, HF_LANG_CODES, TONE_PARAMS, DEFAULT_MODEL

class MBartTranslator:
    """
    Traducteur basé sur l'API d'inférence Hugging Face.
    Ultra-léger car le modèle est chargé côté HF.
    """

    _instance: Optional['MBartTranslator'] = None
    _lock = asyncio.Lock()

    def __init__(self):
        """Initialisation légère - pas de chargement de modèle"""
        self.client = None
        self.model = DEFAULT_MODEL
        self.api_key = os.environ.get("HF_TOKEN")
        
        if not self.api_key:
            print("⚠️ HF_TOKEN non trouvé dans les variables d'environnement")
            print("💡 Ajoutez votre token Hugging Face dans les secrets Leapcell")
        
        self.client = InferenceClient(
            provider="auto",
            api_key=self.api_key
        )

    @classmethod
    async def get_instance(cls) -> 'MBartTranslator':
        """Obtient l'instance unique (instantané - pas de chargement)"""
        if cls._instance is None:
            async with cls._lock:
                if cls._instance is None:
                    cls._instance = cls()
        return cls._instance

    def _prepare_text(self, text: str, tone: Tone) -> str:
        """Prépare le texte selon la tonalité"""
        params = TONE_PARAMS.get(tone, TONE_PARAMS[Tone.STANDARD])
        if params["prepend"]:
            return f"{params['prepend']}{text}"
        return text

    def _postprocess_text(self, text: str, tone: Tone) -> str:
        """Nettoie le texte après traduction"""
        params = TONE_PARAMS.get(tone, TONE_PARAMS[Tone.STANDARD])
        if params["prepend"] and text.startswith(params["prepend"]):
            text = text[len(params["prepend"]):]
        return text.strip()

    async def translate(
        self,
        text: str,
        source_lang: Union[str, Language],
        target_lang: Union[str, Language],
        tone: Union[str, Tone] = Tone.STANDARD,
        max_length: int = 200
    ) -> Dict:
        """
        Traduit le texte via l'API Hugging Face.
        Ultra-rapide et sans consommation de mémoire locale.
        """
        # Gestion des types
        if isinstance(source_lang, str):
            source_lang = Language(source_lang)
        if isinstance(target_lang, str):
            target_lang = Language(target_lang)
        if isinstance(tone, str):
            tone = Tone(tone)

        # Si même langue, retour direct
        if source_lang == target_lang:
            return {
                "success": True,
                "translated_text": text,
                "source_lang": source_lang.value,
                "target_lang": target_lang.value,
                "tone": tone.value,
                "confidence": 1.0
            }

        try:
            # Préparation du texte selon la tonalité
            prepared_text = self._prepare_text(text, tone)
            
            # Appel API (dans un thread pool pour ne pas bloquer)
            loop = asyncio.get_running_loop()
            
            def translate_sync():
                return self.client.translation(
                    prepared_text,
                    model=self.model,
                    # Optionnel: spécifier les langues si nécessaire
                    # parameters={"src_lang": HF_LANG_CODES[source_lang]},
                )

            result = await loop.run_in_executor(None, translate_sync)
            
            # Post-traitement
            translated = self._postprocess_text(result, tone)

            return {
                "success": True,
                "translated_text": translated,
                "source_lang": source_lang.value,
                "target_lang": target_lang.value,
                "tone": tone.value,
                "confidence": 0.95
            }

        except Exception as e:
            return {
                "success": False,
                "translated_text": text,
                "source_lang": source_lang.value,
                "target_lang": target_lang.value,
                "tone": tone.value if isinstance(tone, Tone) else tone,
                "error": str(e)
            }

    def get_supported_languages(self) -> List[str]:
        """Retourne la liste des codes de langue supportés."""
        return [lang.value for lang in Language]

    async def close(self):
        """Libère les ressources (rien à faire car pas de modèle local)"""
        pass
