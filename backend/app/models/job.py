from typing import Optional, List, Dict, Any
from sqlmodel import Field, SQLModel, Relationship, Column, JSON
from datetime import datetime
from enum import Enum

class JobType(str, Enum):
    SCRAPER = "scraper"
    PDF_PROCESSOR = "pdf_processor"
    API_SYNC = "api_sync"
    CUSTOM = "custom"

class JobStatus(str, Enum):
    IDLE = "idle"
    RUNNING = "running"
    FAILED = "failed"
    COMPLETED = "completed"

class JobBase(SQLModel):
    name: str = Field(index=True)
    description: Optional[str] = None
    type: JobType
    schedule: Optional[str] = None  # Cron expression
    configuration: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))
    owner_id: Optional[int] = Field(default=None, foreign_key="user.id")

class Job(JobBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    status: JobStatus = Field(default=JobStatus.IDLE)
    last_run_at: Optional[datetime] = None
    next_run_at: Optional[datetime] = None
    last_duration_ms: Optional[int] = None
    last_exit_code: Optional[int] = None
    
    # Relationships
    # owner: Optional["User"] = Relationship(back_populates="jobs")
    # runs: List["JobRun"] = Relationship(back_populates="job")

class JobCreate(JobBase):
    pass

class JobRead(JobBase):
    id: int
    status: JobStatus
    last_run_at: Optional[datetime]
    next_run_at: Optional[datetime]
