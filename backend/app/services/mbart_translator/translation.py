from typing import Optional
from deep_translator import GoogleTranslator
from app.models.user import LanguageEnum, MessageToneEnum
from app.schemas.message import TranslationRequest, TranslationResponse
from app.core.config import settings


class TranslationService:
    """Translation service using Google Translate or DeepL"""
    
    # Tone adjustments (can be expanded with more sophisticated NLP)
    TONE_PREFIXES = {
        MessageToneEnum.CASUAL: "",
        MessageToneEnum.STANDARD: "",
        MessageToneEnum.FORMAL: ""
    }
    
    TONE_SUFFIXES = {
        MessageToneEnum.CASUAL: "",
        MessageToneEnum.STANDARD: "",
        MessageToneEnum.FORMAL: ""
    }
    
    @staticmethod
    def _get_language_code(language: LanguageEnum) -> str:
        """Convert LanguageEnum to translator language code"""
        mapping = {
            LanguageEnum.FR: "fr",
            LanguageEnum.EN: "en",
            LanguageEnum.ES: "es",
            LanguageEnum.DE: "de",
            LanguageEnum.IT: "it",
            LanguageEnum.PT: "pt",
            LanguageEnum.ZH: "zh-CN",
            LanguageEnum.JA: "ja",
            LanguageEnum.AR: "ar",
        }
        return mapping.get(language, "en")
    
    @staticmethod
    async def translate_text(
        text: str,
        source_language: LanguageEnum,
        target_language: LanguageEnum,
        tone: MessageToneEnum = MessageToneEnum.STANDARD
    ) -> TranslationResponse:
        """
        Translate text from source language to target language.
        
        Args:
            text: Text to translate
            source_language: Source language
            target_language: Target language
            tone: Message tone (casual, standard, formal)
        
        Returns:
            TranslationResponse with translated text
        """
        try:
            # If languages are the same, no translation needed
            if source_language == target_language:
                return TranslationResponse(
                    translated_text=text,
                    source_language=source_language,
                    target_language=target_language,
                    confidence=1.0
                )
            
            # Get language codes
            source_code = TranslationService._get_language_code(source_language)
            target_code = TranslationService._get_language_code(target_language)
            
            # Apply tone prefix (for future NLP enhancement)
            adjusted_text = text
            
            # Translate using Google Translator
            translator = GoogleTranslator(source=source_code, target=target_code)
            translated = translator.translate(adjusted_text)
            
            # Apply tone suffix (for future NLP enhancement)
            # This is where we could add tone adjustment post-processing
            
            return TranslationResponse(
                translated_text=translated,
                source_language=source_language,
                target_language=target_language,
                confidence=0.95  # Google Translate doesn't provide confidence scores
            )
            
        except Exception as e:
            # Log error and return original text
            print(f"Translation error: {str(e)}")
            return TranslationResponse(
                translated_text=text,  # Fallback to original
                source_language=source_language,
                target_language=target_language,
                confidence=0.0
            )
    
    @staticmethod
    async def translate_request(
        translation_request: TranslationRequest
    ) -> TranslationResponse:
        """Translate from TranslationRequest schema"""
        return await TranslationService.translate_text(
            text=translation_request.text,
            source_language=translation_request.source_language,
            target_language=translation_request.target_language,
            tone=translation_request.tone
        )
    
    @staticmethod
    def detect_language(text: str) -> Optional[LanguageEnum]:
        """
        Detect language of text.
        
        Args:
            text: Text to analyze
        
        Returns:
            Detected LanguageEnum or None if detection fails
        """
        try:
            from langdetect import detect
            detected = detect(text)
            
            # Map detected language to LanguageEnum
            mapping = {
                "fr": LanguageEnum.FR,
                "en": LanguageEnum.EN,
                "es": LanguageEnum.ES,
                "de": LanguageEnum.DE,
                "it": LanguageEnum.IT,
                "pt": LanguageEnum.PT,
                "zh-cn": LanguageEnum.ZH,
                "zh-tw": LanguageEnum.ZH,
                "ja": LanguageEnum.JA,
                "ar": LanguageEnum.AR,
            }
            
            return mapping.get(detected, LanguageEnum.EN)
            
        except Exception:
            return None


translation_service = TranslationService()
