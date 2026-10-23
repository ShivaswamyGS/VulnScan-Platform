"""
Prediction service — bridges a Report to the ML inference pipeline
and persists the result.

Workflow:

Report
    -> preprocessing
    -> ML prediction
    -> severity
    -> confidence
    -> automatic priority
    -> store prediction
    -> display on dashboard

Priority:
    Critical -> 1
    High     -> 2
    Medium   -> 3
    Low      -> 4

An existing manually assigned priority is never overwritten.
"""

import logging

from sqlalchemy.orm import Session

from app.core.exceptions import AppException
from app.models.enums import SeverityEnum
from app.models.prediction import Prediction
from app.models.report import Report
from app.services.ml_service import (
    MLServiceError,
    predict_severity,
)

logger = logging.getLogger(__name__)


# =========================================================
# AUTOMATIC PRIORITY MAPPING
# =========================================================

SEVERITY_PRIORITY = {
    SeverityEnum.CRITICAL: 1,
    SeverityEnum.HIGH: 2,
    SeverityEnum.MEDIUM: 3,
    SeverityEnum.LOW: 4,
}


# =========================================================
# BUILD INFERENCE TEXT
# =========================================================

def _build_inference_text(
    report: Report,
) -> str:
    """
    Combine the fields most likely to carry severity
    signal into one text blob for the ML model.
    """

    parts = [
        report.title,
        report.description,
        f"Expected: {report.expected_result}",
        f"Actual: {report.actual_result}",
    ]

    return " ".join(
        p for p in parts if p
    )


# =========================================================
# CALCULATE PRIORITY
# =========================================================

def _calculate_priority(
    severity: SeverityEnum,
) -> int:
    """
    Convert predicted severity into an actionable
    priority ranking.

    1 = highest priority
    4 = lowest priority
    """

    priority = SEVERITY_PRIORITY.get(
        severity
    )

    if priority is None:
        raise AppException(
            f"Unsupported severity: {severity}",
            status_code=422,
        )

    return priority


# =========================================================
# RUN PREDICTION
# =========================================================

def run_prediction_for_report(
    db: Session,
    report: Report,
) -> Prediction:
    """
    Run ML inference for a vulnerability report.

    The prediction is stored as a new Prediction row.

    The report receives an automatic priority only when
    it does not already have a manually assigned priority.
    """

    text = _build_inference_text(
        report
    )

    # -----------------------------------------------------
    # RUN ML MODEL
    # -----------------------------------------------------

    try:
        result = predict_severity(
            text
        )

    except MLServiceError as exc:
        logger.warning(
            "Prediction failed for report_id=%s: %s",
            report.id,
            exc,
        )

        raise AppException(
            str(exc),
            status_code=422,
        ) from exc

    # -----------------------------------------------------
    # NORMALIZE SEVERITY
    # -----------------------------------------------------

    try:
        severity_enum = SeverityEnum(
            result.severity.lower()
        )

    except ValueError as exc:
        logger.error(
            "Invalid ML severity '%s' for report_id=%s",
            result.severity,
            report.id,
        )

        raise AppException(
            "ML model returned an invalid severity",
            status_code=422,
        ) from exc

    # -----------------------------------------------------
    # AUTOMATIC PRIORITY
    # -----------------------------------------------------

    calculated_priority = _calculate_priority(
        severity_enum
    )

    # Only assign automatic priority when
    # no human priority exists.
    if report.priority is None:
        report.priority = calculated_priority

        logger.info(
            "Automatic priority assigned: "
            "report_id=%s severity=%s priority=%s",
            report.id,
            severity_enum.value,
            calculated_priority,
        )

    else:
        logger.info(
            "Keeping existing manual priority: "
            "report_id=%s priority=%s",
            report.id,
            report.priority,
        )

    # -----------------------------------------------------
    # CREATE PREDICTION RECORD
    # -----------------------------------------------------

    prediction = Prediction(
        report_id=report.id,
        predicted_severity=severity_enum,
        confidence_score=result.confidence,
        explanation=result.explanation,
        model_version=result.model_version,
    )

    db.add(prediction)

    # -----------------------------------------------------
    # SAVE BOTH CHANGES
    # -----------------------------------------------------

    db.commit()
    db.refresh(prediction)

    logger.info(
        "Prediction created for report_id=%s: "
        "severity=%s confidence=%.2f priority=%s",
        report.id,
        severity_enum.value,
        result.confidence,
        report.priority,
    )

    return prediction