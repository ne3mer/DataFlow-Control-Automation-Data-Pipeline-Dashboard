from datetime import datetime, timedelta
from typing import Any, Dict, List

from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.api import deps
from app.core.db import get_session
from app.models.job import Job, JobStatus
from app.models.pipeline import Pipeline, PipelineStatus
from app.models.run import JobRun
from app.models.user import User

router = APIRouter()


@router.get("/summary")
def dashboard_summary(
    session: Session = Depends(get_session),
    current_user: User = Depends(deps.get_current_user),
) -> Dict[str, Any]:
    """
    High-level summary metrics for the dashboard.
    """
    total_jobs = session.exec(select(Job)).all()
    total_pipelines = session.exec(select(Pipeline)).all()

    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    todays_runs = session.exec(
        select(JobRun).where(JobRun.started_at >= today_start)
    ).all()

    failures_today = [r for r in todays_runs if r.exit_code and r.exit_code != 0]
    failure_rate = (
        len(failures_today) / len(todays_runs) * 100 if todays_runs else 0.0
    )

    active_pipelines = [
        p for p in total_pipelines if p.status in {PipelineStatus.RUNNING, PipelineStatus.DEGRADED}
    ]

    return {
        "total_jobs": len(total_jobs),
        "active_pipelines": len(active_pipelines),
        "todays_runs": len(todays_runs),
        "failure_rate": round(failure_rate, 2),
    }


@router.get("/runs-per-day")
def runs_per_day(
    days: int = 7,
    session: Session = Depends(get_session),
    current_user: User = Depends(deps.get_current_user),
) -> List[Dict[str, Any]]:
    """
    Number of job runs per day over the last N days.
    """
    now = datetime.utcnow()
    start = now - timedelta(days=days)

    runs = session.exec(
        select(JobRun).where(JobRun.started_at >= start)
    ).all()

    buckets: Dict[str, Dict[str, Any]] = {}
    for r in runs:
        if not r.started_at:
            continue
        day = r.started_at.date().isoformat()
        if day not in buckets:
            buckets[day] = {"date": day, "total": 0, "failed": 0}
        buckets[day]["total"] += 1
        if r.exit_code and r.exit_code != 0:
            buckets[day]["failed"] += 1

    # Ensure we return all days in range, even if zero
    result: List[Dict[str, Any]] = []
    for i in range(days):
        day = (start + timedelta(days=i)).date().isoformat()
        result.append(buckets.get(day, {"date": day, "total": 0, "failed": 0}))

    return result


@router.get("/recent-runs")
def recent_runs(
    limit: int = 10,
    session: Session = Depends(get_session),
    current_user: User = Depends(deps.get_current_user),
) -> List[Dict[str, Any]]:
    """
    Get recent job runs for the activity feed.
    """
    from sqlmodel import select
    
    runs = session.exec(
        select(JobRun)
        .order_by(JobRun.started_at.desc())
        .limit(limit)
    ).all()
    
    result = []
    for run in runs:
        job = session.get(Job, run.job_id)
        if job:
            result.append({
                "id": run.id,
                "job_name": job.name,
                "status": run.status,
                "duration_ms": run.duration_ms,
                "started_at": run.started_at.isoformat() if run.started_at else None,
                "exit_code": run.exit_code,
            })
    
    return result


