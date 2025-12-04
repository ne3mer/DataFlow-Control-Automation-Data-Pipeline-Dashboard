from .celery_app import celery_app
import time
import httpx
from bs4 import BeautifulSoup

@celery_app.task(acks_late=True)
def test_task(word: str) -> str:
    time.sleep(5)
    return f"test task return {word}"

@celery_app.task(acks_late=True)
def scrape_task(url: str) -> str:
    try:
        response = httpx.get(url, follow_redirects=True)
        soup = BeautifulSoup(response.text, 'html.parser')
        title = soup.title.string if soup.title else "No title found"
        return f"Scraped {url}: Title='{title}', Length={len(response.text)} bytes"
    except Exception as e:
        return f"Failed to scrape {url}: {str(e)}"
