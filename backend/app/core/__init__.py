"""Paquet `core` : configuration, sécurité et dépendances FastAPI.

Volontairement vide de ré-exports. Importer ici `app.core.dependencies`
créait un cycle : `app.db.session` importe `app.core.config`, ce qui exécute
ce fichier, qui importe `dependencies`, qui réimporte `app.db.session` encore
partiellement initialisé. Chaque module importe donc son sous-module
directement (`from app.core.config import settings`), ce que fait déjà tout
le code existant.
"""
