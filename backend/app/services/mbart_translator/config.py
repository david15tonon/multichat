from enum import Enum
from typing import Dict, Any

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

# Mapping des codes de langue pour l'API
HF_LANG_CODES = {
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

# Modèle à utiliser (version fastest pour performance)
DEFAULT_MODEL = "facebook/mbart-large-50-many-to-many-mmt:fastest"

# Paramètres de tonalité (pour pré/post traitement)
TONE_PARAMS = {
    Tone.CASUAL: {
        "prepend": "Hey, ",
        "temperature": 0.9,
    },
    Tone.STANDARD: {
        "prepend": "",
        "temperature": 0.7,
    },
    Tone.FORMAL: {
        "prepend": "Dear sir/madam, ",
        "temperature": 0.5,
    }
}
