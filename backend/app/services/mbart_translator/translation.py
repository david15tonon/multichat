import asyncio
import torch
from transformers import MBartForConditionalGeneration, MBart50TokenizerFast
from typing import Optional, Dict, List, Union
from .config import Language, Tone, MBART_LANG_CODES, TONE_PARAMS, DEFAULT_MODEL_NAME

class MBartTranslator:
    """
    Traducteur indépendant basé sur mBART-50 avec lazy loading.
    Le modèle n'est chargé que lors de la première utilisation.
    Utilisation :
        translator = await MBartTranslator.get_instance()
        result = await translator.translate("Hello", source_lang="en", target_lang="fr", tone="casual")
    """

    _instance: Optional['MBartTranslator'] = None
    _lock = asyncio.Lock()
    _load_task: Optional[asyncio.Task] = None

    def __init__(self):
        """Initialisation légère sans chargement du modèle"""
        self.model = None
        self.tokenizer = None
        self.device = None
        self._loaded = False
        self._load_future = None

    @classmethod
    async def get_instance(cls, model_name: str = DEFAULT_MODEL_NAME) -> 'MBartTranslator':
        """
        Obtient l'instance unique du traducteur (Singleton avec lazy loading).
        Le modèle est chargé automatiquement lors du premier appel.
        """
        if cls._instance is None:
            async with cls._lock:
                if cls._instance is None:
                    cls._instance = cls()
                    # Lance le chargement en arrière-plan mais n'attend pas
                    cls._instance._load_future = asyncio.create_task(
                        cls._instance._load_model(model_name)
                    )
        
        # Si l'instance existe mais que le modèle n'est pas encore chargé,
        # on retourne l'instance immédiatement (le chargement continue en arrière-plan)
        return cls._instance

    async def _load_model(self, model_name: str = DEFAULT_MODEL_NAME):
        """
        Charge le modèle (opération lourde) dans un thread séparé.
        Cette méthode est appelée automatiquement par get_instance.
        """
        if self._loaded:
            return

        print("🔄 Démarrage du chargement de mBART en arrière-plan...")
        
        def load_sync():
            # Détection du device
            device = "cuda" if torch.cuda.is_available() else "cpu"
            
            print(f"Chargement de mBART sur {device}...")
            tokenizer = MBart50TokenizerFast.from_pretrained(model_name)
            model = MBartForConditionalGeneration.from_pretrained(
                model_name,
                torch_dtype=torch.float16 if device == "cuda" else torch.float32,
                low_cpu_mem_usage=True
            ).to(device)
            model.eval()
            return device, tokenizer, model

        # Exécute le chargement synchrone dans un thread pool
        loop = asyncio.get_running_loop()
        self.device, self.tokenizer, self.model = await loop.run_in_executor(
            None, load_sync
        )
        
        self._loaded = True
        print(f"✅ Modèle mBART chargé avec succès sur {self.device}")

    async def ensure_loaded(self):
        """
        Attend que le modèle soit chargé.
        Utile si vous voulez être sûr que le modèle est prêt avant une traduction.
        """
        if self._loaded:
            return
        
        if self._load_future:
            await self._load_future
        else:
            # Si pas de chargement en cours, on le lance
            self._load_future = asyncio.create_task(self._load_model())
            await self._load_future

    def _map_language(self, lang: Union[str, Language]) -> str:
        """Convertit un code de langue (ex: 'fr') en code mBART (ex: 'fr_XX')."""
        if isinstance(lang, str):
            # Essayer de convertir en Enum
            try:
                lang = Language(lang)
            except ValueError:
                raise ValueError(f"Langue non supportée : {lang}")
        if lang not in MBART_LANG_CODES:
            raise ValueError(f"Langue {lang} non supportée par mBART")
        return MBART_LANG_CODES[lang]

    def translate_sync(
        self,
        text: str,
        source_lang: Union[str, Language],
        target_lang: Union[str, Language],
        tone: Union[str, Tone] = Tone.STANDARD,
        max_length: int = 200
    ) -> Dict:
        """
        Version synchrone de la traduction.
        Attention: le modèle doit être chargé avant d'appeler cette méthode.
        """
        # Vérification que le modèle est chargé
        if not self._loaded:
            raise RuntimeError("Le modèle n'est pas encore chargé. Appelez ensure_loaded() d'abord.")

        # Gestion des types
        if isinstance(source_lang, str):
            source_lang = Language(source_lang)
        if isinstance(target_lang, str):
            target_lang = Language(target_lang)
        if isinstance(tone, str):
            tone = Tone(tone)

        if source_lang == target_lang:
            return {
                "success": True,
                "translated_text": text,
                "source_lang": source_lang.value,
                "target_lang": target_lang.value,
                "confidence": 1.0
            }

        try:
            src_code = self._map_language(source_lang)
            tgt_code = self._map_language(target_lang)

            self.tokenizer.src_lang = src_code
            inputs = self.tokenizer(
                text,
                return_tensors="pt",
                truncation=True,
                max_length=512
            ).to(self.device)

            # Paramètres de génération
            gen_params = TONE_PARAMS.get(tone, TONE_PARAMS[Tone.STANDARD]).copy()
            gen_params.update({
                "max_length": max_length,
                "forced_bos_token_id": self.tokenizer.lang_code_to_id[tgt_code],
                "early_stopping": True,
                "no_repeat_ngram_size": 3,
            })

            with torch.no_grad():
                generated_tokens = self.model.generate(
                    **inputs,
                    **gen_params
                )

            translation = self.tokenizer.batch_decode(
                generated_tokens,
                skip_special_tokens=True
            )[0]

            return {
                "success": True,
                "translated_text": translation,
                "source_lang": source_lang.value,
                "target_lang": target_lang.value,
                "confidence": 0.95  # Valeur indicative
            }

        except Exception as e:
            return {
                "success": False,
                "translated_text": text,
                "source_lang": source_lang.value,
                "target_lang": target_lang.value,
                "error": str(e)
            }

    async def translate(
        self,
        text: str,
        source_lang: Union[str, Language],
        target_lang: Union[str, Language],
        tone: Union[str, Tone] = Tone.STANDARD,
        max_length: int = 200
    ) -> Dict:
        """
        Version asynchrone de la traduction avec lazy loading.
        Si le modèle n'est pas encore chargé, cette méthode attend qu'il le soit.
        """
        # Attend que le modèle soit chargé
        await self.ensure_loaded()
        
        # Exécute la traduction dans un thread pool
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(
            None,
            self.translate_sync,
            text,
            source_lang,
            target_lang,
            tone,
            max_length
        )

    def get_supported_languages(self) -> List[str]:
        """Retourne la liste des codes de langue supportés."""
        return [lang.value for lang in Language]

    async def close(self):
        """Libère les ressources (modèle et tokenizer)"""
        self.model = None
        self.tokenizer = None
        self._loaded = False
        if self._load_future and not self._load_future.done():
            self._load_future.cancel()
        print("🔌 Ressources mBART libérées")
