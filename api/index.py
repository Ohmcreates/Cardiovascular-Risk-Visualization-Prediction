import sys
import os
import traceback
from pathlib import Path

# Setup paths for Vercel Serverless Function
lib_dir = str(Path(__file__).resolve().parent / "lib")
if lib_dir not in sys.path:
    sys.path.insert(0, lib_dir)

try:
    from main import app
except Exception as e:
    err_tb = traceback.format_exc()
    print(f"Error loading main app: {err_tb}")
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse
    app = FastAPI()
    
    @app.api_route("/{path_name:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"])
    def catch_all(path_name: str):
        return JSONResponse(
            status_code=500,
            content={"error": str(e), "traceback": err_tb}
        )
