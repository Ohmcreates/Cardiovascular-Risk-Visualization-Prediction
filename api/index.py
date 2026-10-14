import sys
import os
from pathlib import Path

# Setup paths for Vercel Serverless Function
root_dir = Path(__file__).resolve().parent.parent
backend_src = root_dir / "backend" / "src"

for path_entry in [str(backend_src), str(root_dir / "backend"), str(root_dir)]:
    if path_entry not in sys.path:
        sys.path.insert(0, path_entry)

# Import the FastAPI application
from main import app
