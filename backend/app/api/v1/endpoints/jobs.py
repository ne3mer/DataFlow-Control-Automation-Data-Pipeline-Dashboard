from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.api import deps
from app.core.db import get_session
from app.models.job import Job, JobCreate, JobRead, JobStatus, JobType
from app.models.user import User
from app.worker.tasks import test_task, scrape_task

router = APIRouter()

@router.get("/", response_model=List[JobRead])
def read_jobs(
    session: Session = Depends(get_session),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve jobs.
    """
    statement = select(Job).offset(skip).limit(limit)
    jobs = session.exec(statement).all()
    return jobs

@router.post("/", response_model=JobRead)
def create_job(
    job_in: JobCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Create new job.
    """
    job = Job.from_orm(job_in)
    job.owner_id = current_user.id
    session.add(job)
    session.commit()
    session.refresh(job)
    return job

@router.get("/{job_id}", response_model=JobRead)
def read_job(
    job_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get job by ID.
    """
    job = session.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.post("/{job_id}/run", response_model=JobRead)
def run_job(
    job_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Trigger a job run manually.
    """
    job = session.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Trigger Celery task
    if job.type == JobType.SCRAPER:
        url = job.configuration.get("url", "https://example.com")
        task = scrape_task.delay(url)
    else:
        task = test_task.delay(job.name)
    
    job.status = JobStatus.RUNNING
    session.add(job)
    session.commit()
    session.refresh(job)
    return job
