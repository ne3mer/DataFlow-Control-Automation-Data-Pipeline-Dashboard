from .celery_app import celery_app
import time

@celery_app.task(acks_late=True)
def test_task(word: str) -> str:
    time.sleep(5)
    return f"test task return {word}"
