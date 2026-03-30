from pathlib import Path

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Fourier Studio"
    DEBUG: bool = True
    UPLOAD_DIR: Path = Path("/tmp/fourier_studio_uploads")
    MAX_IMAGE_SIZE_MB: int = 20
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    class Config:
        env_file = ".env"


settings = Settings()
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
