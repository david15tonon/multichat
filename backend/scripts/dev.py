"""Point d'entrée de développement du backend.

Lance les tests unitaires AVANT de démarrer uvicorn et refuse de démarrer si
l'un d'eux échoue (même principe que le hook npm `predev`). Un serveur qui
tourne signifie donc que les tests unitaires sont au vert.

    python -m scripts.dev              # avec --reload
    python -m scripts.dev --no-reload  # session de vérification fiable
"""

import subprocess
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
REPO_ROOT = BACKEND_DIR.parent
UNIT_TESTS = REPO_ROOT / "tests" / "test_unit"


def run_unit_tests() -> None:
    """Exécute les tests unitaires ; quitte avec le code d'erreur si échec."""
    if not UNIT_TESTS.is_dir() or not any(UNIT_TESTS.glob("test_*.py")):
        print(f"⚠️  Aucun test unitaire dans {UNIT_TESTS} — garde-fou inactif.")
        return

    print(f"🧪 pytest {UNIT_TESTS.relative_to(REPO_ROOT)}")
    result = subprocess.run(
        [sys.executable, "-m", "pytest", str(UNIT_TESTS), "-q"],
        cwd=REPO_ROOT,
    )
    if result.returncode != 0:
        print("\n❌ Tests unitaires en échec — le serveur ne démarre pas.")
        sys.exit(result.returncode)
    print("✅ Tests unitaires au vert.\n")


def main() -> None:
    run_unit_tests()

    import uvicorn

    reload = "--no-reload" not in sys.argv
    print(f"🚀 uvicorn app.main:app (reload={reload})")
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8000,
        reload=reload,
        app_dir=str(BACKEND_DIR),
    )


if __name__ == "__main__":
    main()
