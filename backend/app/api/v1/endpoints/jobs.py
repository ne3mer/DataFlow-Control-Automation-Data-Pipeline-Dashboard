from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.api import deps
from app.core.db import get_session
from app.models.job import Job, JobCreate, JobRead, JobStatus, JobType
from app.models.run import JobRun, JobRunRead
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
        task = scrape_task.delay(job.id, url)
    else:
        task = test_task.delay(job.id, job.name)
    
    job.status = JobStatus.RUNNING
    job.last_celery_task_id = task.id
    session.add(job)
    session.commit()
    session.refresh(job)
    return job

@router.post("/{job_id}/cancel", response_model=JobRead)
def cancel_job(
    job_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Cancel a running job.
    """
    job = session.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job.status != JobStatus.RUNNING:
        raise HTTPException(status_code=400, detail="Job is not running")

    if job.last_celery_task_id:
        from app.worker.celery_app import celery_app
        celery_app.control.revoke(job.last_celery_task_id, terminate=True)
    
    job.status = JobStatus.FAILED
    session.add(job)
    session.commit()
    session.refresh(job)
    return job


@router.get("/{job_id}/runs", response_model=List[JobRunRead])
def read_job_runs(
    job_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    List recent runs for a job.
    """
    statement = (
        select(JobRun)
        .where(JobRun.job_id == job_id)
        .order_by(JobRun.started_at.desc())
        .limit(50)
    )
    runs = session.exec(statement).all()
    return runs
