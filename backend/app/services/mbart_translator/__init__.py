# Lazy loading - n'importe pas immédiatement pour éviter le chargement lourd au démarrage
from .config import Language, Tone

__all__ = ["MBartTranslator", "Language", "Tone"]

# Import différé de MBartTranslator uniquement quand on y accède
def __getattr__(name):
    if name == "MBartTranslator":
        from .translation import MBartTranslator
        return MBartTranslator
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
