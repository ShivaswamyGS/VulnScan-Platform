"""
Centralized logging configuration.

Call `configure_logging()` once at application startup (done in app/main.py).
Every other module should simply do:

    import logging
    logger = logging.getLogger(__name__)
"""

import logging
import sys

from app.core.config import settings


def configure_logging() -> None:
    log_level = logging.DEBUG if settings.DEBUG else logging.INFO

    formatter = logging.Formatter(
        fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    stream_handler = logging.StreamHandler(sys.stdout)
    stream_handler.setFormatter(formatter)

    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)

    # Avoid duplicate handlers on hot-reload
    if not root_logger.handlers:
        root_logger.addHandler(stream_handler)

    # Quiet down noisy third-party loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("passlib").setLevel(logging.ERROR)
