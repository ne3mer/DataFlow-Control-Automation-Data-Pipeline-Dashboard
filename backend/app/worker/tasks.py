from .celery_app import celery_app
import time
import httpx
from bs4 import BeautifulSoup
from fake_useragent import UserAgent
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

@celery_app.task(acks_late=True)
def test_task(word: str) -> str:
    time.sleep(5)
    return f"test task return {word}"

@celery_app.task(acks_late=True, bind=True)
@retry(
    stop=stop_after_attempt(3), 
    wait=wait_exponential(multiplier=1, min=4, max=10),
    retry=retry_if_exception_type(httpx.RequestError)
)
def scrape_task(self, url: str) -> str:
    try:
        ua = UserAgent()
        headers = {'User-Agent': ua.random}
        
        response = httpx.get(url, follow_redirects=True, headers=headers, timeout=10.0)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        title = soup.title.string if soup.title else "No title found"
        return f"Scraped {url}: Title='{title}', Length={len(response.text)} bytes"
    except Exception as e:
        # If it's the last attempt, return the error
        if self.request.retries == 2: # 0-indexed, so 2 is the 3rd attempt
             return f"Failed to scrape {url} after retries: {str(e)}"
        raise e # Re-raise to trigger retry
