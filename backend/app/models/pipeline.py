from typing import Optional, List, Dict, Any
from sqlmodel import Field, SQLModel, Column, JSON
from enum import Enum

class PipelineStatus(str, Enum):
    IDLE = "idle"
    RUNNING = "running"
    DEGRADED = "degraded"
    FAILED = "failed"

class PipelineBase(SQLModel):
    name: str = Field(index=True)
    description: Optional[str] = None
    steps: List[Dict[str, Any]] = Field(default=[], sa_column=Column(JSON)) # Ordered list of job IDs/configs

class Pipeline(PipelineBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    status: PipelineStatus = Field(default=PipelineStatus.IDLE)

class PipelineCreate(PipelineBase):
    pass

class PipelineRead(PipelineBase):
    id: int
    status: PipelineStatus
