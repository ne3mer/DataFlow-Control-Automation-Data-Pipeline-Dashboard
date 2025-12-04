from datetime import datetime
import time

import httpx
from bs4 import BeautifulSoup
from fake_useragent import UserAgent
from sqlmodel import Session
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential

from app.core.db import engine
from app.models.job import Job, JobStatus
from app.models.run import JobRun, RunStatus

from .celery_app import celery_app


def _update_job_after_run(
    session: Session,
    job: Job,
    run: JobRun,
    status: RunStatus,
    exit_code: int,
    summary: str,
) -> None:
    now = datetime.utcnow()
    run.finished_at = now
    if run.started_at:
        run.duration_ms = int((now - run.started_at).total_seconds() * 1000)
    run.status = status
    run.exit_code = exit_code
    run.summary = summary

    job.last_run_at = now
    job.last_duration_ms = run.duration_ms
    job.last_exit_code = exit_code
    job.status = JobStatus.COMPLETED if status == RunStatus.COMPLETED else JobStatus.FAILED

    session.add(run)
    session.add(job)
    session.commit()


@celery_app.task(acks_late=True)
def test_task(job_id: int, word: str) -> str:
    """Simple demo task that records a JobRun."""
    with Session(engine) as session:
        job = session.get(Job, job_id)
        if not job:
            # Fallback: just run without persistence
            time.sleep(5)
            return f"test task (orphan) return {word}"

        run = JobRun(job_id=job.id)
        session.add(run)
        session.commit()
        session.refresh(run)

        # Simulate work
        time.sleep(5)

        summary = f"Test task for job '{job.name}' completed. Payload='{word}'."
        _update_job_after_run(session, job, run, RunStatus.COMPLETED, 0, summary)

        return summary


@celery_app.task(acks_late=True, bind=True)
@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=4, max=10),
    retry=retry_if_exception_type(httpx.RequestError),
)
def scrape_task(self, job_id: int, url: str) -> str:
    with Session(engine) as session:
        job = session.get(Job, job_id)
        if not job:
            # Fallback: behave like a simple scraper without persistence
            ua = UserAgent()
            headers = {"User-Agent": ua.random}
            response = httpx.get(url, follow_redirects=True, headers=headers, timeout=10.0)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, "html.parser")
            title = soup.title.string if soup.title else "No title found"
            return f"Scraped {url}: Title='{title}', Length={len(response.text)} bytes"

        run = JobRun(job_id=job.id)
        session.add(run)
        session.commit()
        session.refresh(run)

        try:
            ua = UserAgent()
            headers = {"User-Agent": ua.random}

            response = httpx.get(url, follow_redirects=True, headers=headers, timeout=10.0)
            response.raise_for_status()

            soup = BeautifulSoup(response.text, "html.parser")
            title = soup.title.string if soup.title else "No title found"
            summary = f"Scraped {url}: Title='{title}', Length={len(response.text)} bytes"

            run.logs = f"HTTP {response.status_code}\nTitle: {title}\nBody length: {len(response.text)}"
            run.metrics = {"content_length": len(response.text)}

            _update_job_after_run(session, job, run, RunStatus.COMPLETED, 0, summary)
            return summary
        except Exception as e:
            # If it's the last attempt, mark as failed but return a friendly message
            if self.request.retries == 2:  # 0-indexed, so 2 is the 3rd attempt
                summary = f"Failed to scrape {url} after retries: {str(e)}"
                run.logs = (run.logs or "") + f"\nError: {summary}"
                _update_job_after_run(session, job, run, RunStatus.FAILED, 1, summary)
                return summary
            # Otherwise trigger retry
            raise e

