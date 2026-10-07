"""Configuration des tests unitaires backend.

Place `backend/` sur sys.path pour que `from app... import ...` fonctionne sans
lancer uvicorn, et charge `backend/.env` afin que les réglages soient ceux du
développement. Aucun serveur, aucune base : les dépendances sont mockées.
"""

import os
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[2] / "backend"
sys.path.insert(0, str(BACKEND_DIR))

_env_file = BACKEND_DIR / ".env"
if _env_file.is_file():
    for line in _env_file.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        os.environ.setdefault(key.strip(), value.strip())
