"""
Application entrypoint.

Run locally with:
uvicorn app.main:app --reload --port 8000

Responsibilities of this file ONLY:

- Instantiate the FastAPI app
- Wire up middleware, exception handlers, and the versioned API router

Everything else lives in dedicated modules.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.exceptions import register_exception_handlers
from app.core.logging_config import configure_logging


configure_logging()

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    logger.info(
        "%s starting up in %s mode",
        settings.APP_NAME,
        settings.APP_ENV,
    )

    yield

    logger.info(
        "%s shutting down",
        settings.APP_NAME,
    )


app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "AI-based vulnerability triage platform "
        "for internal security teams."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

@app.get("/api/v1/health")
def health_check():
    return {"status": "ok"}
# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# Global exception handlers
# ---------------------------------------------------------

register_exception_handlers(app)


# ---------------------------------------------------------
# Versioned API routes
# ---------------------------------------------------------

app.include_router(
    api_router,
    prefix=settings.API_V1_PREFIX,
)