import time
import logging
from datetime import datetime
from croniter import croniter
from sqlmodel import Session, select
from app.core.db import engine
from app.models.job import Job, JobStatus
from app.worker.tasks import test_task

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_and_enqueue_jobs():
    with Session(engine) as session:
        jobs = session.exec(select(Job)).all()
        now = datetime.utcnow()
        
        for job in jobs:
            if not job.schedule:
                continue
                
            # Calculate next run if not set
            if not job.next_run_at:
                try:
                    iter = croniter(job.schedule, now)
                    job.next_run_at = iter.get_next(datetime)
                    session.add(job)
                    session.commit()
                except Exception as e:
                    logger.error(f"Error parsing schedule for job {job.id}: {e}")
                    continue

            # Check if due
            if job.next_run_at and job.next_run_at <= now:
                logger.info(f"Enqueuing job {job.id}: {job.name}")
                
                # Enqueue task
                test_task.delay(job.name)
                
                # Update job status and next run
                job.last_run_at = now
                job.status = JobStatus.RUNNING
                
                try:
                    iter = croniter(job.schedule, now)
                    job.next_run_at = iter.get_next(datetime)
                except Exception as e:
                    logger.error(f"Error calculating next run for job {job.id}: {e}")
                
                session.add(job)
                session.commit()

def run_scheduler():
    logger.info("Starting Scheduler Service...")
    while True:
        try:
            check_and_enqueue_jobs()
        except Exception as e:
            logger.error(f"Scheduler error: {e}")
        time.sleep(10) # Check every 10 seconds

if __name__ == "__main__":
    run_scheduler()
