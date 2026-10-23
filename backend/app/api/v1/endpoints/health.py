"""
Health check endpoint.
Used by load balancers, Docker healthchecks, and uptime monitors.
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/health", tags=["Health"], summary="Service health check")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
