import sys
from pathlib import Path

# Add backend and backend/src directories to sys.path
backend_dir = Path(__file__).resolve().parent
src_dir = backend_dir / "src"

for p in [str(src_dir), str(backend_dir)]:
    if p not in sys.path:
        sys.path.insert(0, p)
