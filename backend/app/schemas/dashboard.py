from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class DashboardStats(BaseModel):
    """
    Admin dashboard statistics.
    """

    model_config = ConfigDict(from_attributes=True)

    total_reports: int = 0
    open_reports: int = 0
    resolved_reports: int = 0
    critical_reports: int = 0

    critical_count: int = 0
    high_count: int = 0
    medium_count: int = 0
    low_count: int = 0

    status_distribution: dict[str, int] = Field(default_factory=dict)
    severity_distribution: dict[str, int] = Field(default_factory=dict)

    recent_reports: list[Any] = Field(default_factory=list)
    critical_items: list[Any] = Field(default_factory=list)


class CompanyDashboardStats(BaseModel):
    """
    Company dashboard statistics.
    """

    model_config = ConfigDict(from_attributes=True)

    total_reports: int = 0
    open_reports: int = 0
    resolved_reports: int = 0

    critical_count: int = 0
    high_count: int = 0
    medium_count: int = 0
    low_count: int = 0

    severity_distribution: dict[str, int] = Field(
        default_factory=dict
    )

    status_distribution: dict[str, int] = Field(
        default_factory=dict
    )

    recent_reports: list[Any] = Field(
        default_factory=list
    )

    critical_items: list[Any] = Field(
        default_factory=list
    )