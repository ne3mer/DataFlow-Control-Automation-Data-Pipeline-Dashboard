from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional, TYPE_CHECKING

from sqlmodel import Column, Field, JSON, Relationship, SQLModel

from .job import Job, JobStatus
from .pipeline import Pipeline, PipelineStatus


class RunStatus(str, Enum):
    """Generic run status for jobs and pipelines."""

    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class JobRunBase(SQLModel):
    job_id: int = Field(foreign_key="job.id", index=True)
    status: RunStatus = Field(default=RunStatus.RUNNING)
    started_at: datetime = Field(default_factory=datetime.utcnow)
    finished_at: Optional[datetime] = None
    duration_ms: Optional[int] = None
    exit_code: Optional[int] = None
    summary: Optional[str] = None
    logs: Optional[str] = None
    metrics: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))


class JobRun(JobRunBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    # Plain "Job" annotation avoids SQLAlchemy treating Optional[...] as a generic.
    job: Job = Relationship(back_populates="runs")


class JobRunRead(JobRunBase):
    id: int


class PipelineRunBase(SQLModel):
    pipeline_id: int = Field(foreign_key="pipeline.id", index=True)
    status: RunStatus = Field(default=RunStatus.RUNNING)
    started_at: datetime = Field(default_factory=datetime.utcnow)
    finished_at: Optional[datetime] = None
    duration_ms: Optional[int] = None
    summary: Optional[str] = None
    metrics: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))


class PipelineRun(PipelineRunBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    # Plain "Pipeline" annotation avoids SQLAlchemy treating Optional[...] as a generic.
    pipeline: Pipeline = Relationship(back_populates="runs")


class PipelineRunRead(PipelineRunBase):
    id: int



