# Configuration des langues supportées et des paramètres par défaut
from enum import Enum

class Language(str, Enum):
    FR = "fr"
    EN = "en"
    ES = "es"
    DE = "de"
    IT = "it"
    PT = "pt"
    ZH = "zh"
    JA = "ja"
    AR = "ar"

class Tone(str, Enum):
    CASUAL = "casual"
    STANDARD = "standard"
    FORMAL = "formal"

# Mapping vers les codes mBART
MBART_LANG_CODES = {
    Language.FR: "fr_XX",
    Language.EN: "en_XX",
    Language.ES: "es_XX",
    Language.DE: "de_DE",
    Language.IT: "it_IT",
    Language.PT: "pt_XX",
    Language.ZH: "zh_CN",
    Language.JA: "ja_XX",
    Language.AR: "ar_AR",
}

# Paramètres de génération selon le ton
TONE_PARAMS = {
    Tone.CASUAL: {
        "temperature": 0.8,
        "do_sample": True,
        "top_p": 0.9,
    },
    Tone.STANDARD: {
        "temperature": 1.0,
        "do_sample": False,
        "num_beams": 4,
    },
    Tone.FORMAL: {
        "temperature": 0.9,
        "do_sample": True,
        "top_p": 0.95,
        "repetition_penalty": 1.2,
    },
}

# Modèle par défaut
DEFAULT_MODEL_NAME = "facebook/mbart-large-50-many-to-many-mmt"