from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.api import deps
from app.core.db import get_session
from app.models.pipeline import Pipeline, PipelineCreate, PipelineRead, PipelineStatus
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[PipelineRead])
def read_pipelines(
    session: Session = Depends(get_session),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve pipelines.
    """
    statement = select(Pipeline).offset(skip).limit(limit)
    pipelines = session.exec(statement).all()
    return pipelines

@router.post("/", response_model=PipelineRead)
def create_pipeline(
    pipeline_in: PipelineCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new pipeline.
    """
    pipeline = Pipeline.from_orm(pipeline_in)
    session.add(pipeline)
    session.commit()
    session.refresh(pipeline)
    return pipeline

@router.get("/{pipeline_id}", response_model=PipelineRead)
def read_pipeline(
    pipeline_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get pipeline by ID.
    """
    pipeline = session.get(Pipeline, pipeline_id)
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    return pipeline

@router.post("/{pipeline_id}/run", response_model=PipelineRead)
def run_pipeline(
    pipeline_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Trigger a pipeline run manually.
    """
    pipeline = session.get(Pipeline, pipeline_id)
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    
    # Logic to trigger pipeline steps would go here
    # For now, just update status
    pipeline.status = PipelineStatus.RUNNING
    session.add(pipeline)
    session.commit()
    session.refresh(pipeline)
    return pipeline
