"""
Centralized application configuration.

All environment-dependent values are loaded here ONCE and imported
everywhere else via `from app.core.config import settings`.
This is the single source of truth for configuration in the backend.
"""

from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # --- App ---
    APP_NAME: str = "VulnTriage Platform"
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"

    # --- Security ---
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 1440

    # --- Database ---
    # Individual components are kept for documentation/tooling (e.g. Docker healthchecks);
    # the application itself only ever uses the assembled DATABASE_URL below.
    POSTGRES_USER: str = "vulntriage_user"
    POSTGRES_PASSWORD: str = "change-this-password"
    POSTGRES_DB: str = "vulntriage"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    DATABASE_URL: str

    # --- CORS ---
    CORS_ORIGINS: List[str] = ["http://localhost:5173"]

    # --- ML Model Artifacts ---
    # --- ML Model Artifacts ---
    ML_MODEL_PATH: str = "ai/artifacts/model.pkl"
    ML_VECTORIZER_PATH: str = "ai/artifacts/tfidf.pkl"

    # --- Uploads ---
    UPLOAD_DIR: str = "../uploads"
    MAX_UPLOAD_MB: int = 10

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )


@lru_cache
def get_settings() -> Settings:
    """
    Cached settings accessor.
    Using lru_cache ensures the .env file is parsed only once per process.
    """
    return Settings()


settings = get_settings()
