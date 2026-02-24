import asyncio
import torch
from transformers import MBartForConditionalGeneration, MBart50TokenizerFast
from typing import Optional, Dict, List, Union
from .config import Language, Tone, MBART_LANG_CODES, TONE_PARAMS, DEFAULT_MODEL_NAME

class MBartTranslator:
    """
    Traducteur indépendant basé sur mBART-50.
    Utilisation :
        translator = MBartTranslator()
        result = translator.translate("Hello", source_lang="en", target_lang="fr", tone="casual")
    """

    def __init__(self, model_name: str = DEFAULT_MODEL_NAME, device: Optional[str] = None):
        """
        Initialise le modèle et le tokenizer.
        - model_name : nom du modèle Hugging Face
        - device : "cuda" ou "cpu" (auto-détection si None)
        """
        if device is None:
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
        else:
            self.device = device

        print(f"Chargement de mBART sur {self.device}...")
        self.tokenizer = MBart50TokenizerFast.from_pretrained(model_name)
        self.model = MBartForConditionalGeneration.from_pretrained(
            model_name,
            torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
            low_cpu_mem_usage=True
        ).to(self.device)
        self.model.eval()
        print("Modèle mBART chargé avec succès.")

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
        """
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
        Version asynchrone de la traduction.
        """
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