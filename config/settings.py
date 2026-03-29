"""
FREQWAVE application settings.

Override any value via environment variables or a .env file in backend/.
Example:
    MAX_IMAGE_SIZE_MB=50 uvicorn app.main:app --port 8000
"""
from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "FREQWAVE — Fourier Transform Studio"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # File handling
    UPLOAD_DIR: Path = Path("/tmp/freqwave_uploads")
    MAX_IMAGE_SIZE_MB: int = 20

    # CORS — add your frontend URL in production
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
    ]

    # Threading
    WORKER_THREADS: int = 4   # ThreadPoolExecutor max_workers for IFFT operations

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
