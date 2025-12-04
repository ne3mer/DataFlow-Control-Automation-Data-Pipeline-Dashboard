#!/usr/bin/env python3
"""
Script to create and run sample jobs for screenshot/demo purposes.
This will populate your dashboard with real data.
"""

import requests
import time
import sys
from typing import Dict, Any

API_BASE = "http://localhost:8000/api/v1"

def login(email: str, password: str) -> str:
    """Login and get access token"""
    response = requests.post(
        f"{API_BASE}/auth/login",
        data={"username": email, "password": password}
    )
    if response.status_code != 200:
        print(f"❌ Login failed: {response.text}")
        sys.exit(1)
    token = response.json()["access_token"]
    print(f"✅ Logged in successfully")
    return token

def create_job(token: str, job_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new job"""
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(
        f"{API_BASE}/jobs/",
        json=job_data,
        headers=headers
    )
    if response.status_code != 200:
        print(f"❌ Failed to create job '{job_data['name']}': {response.text}")
        return None
    job = response.json()
    print(f"✅ Created job: {job['name']} (ID: {job['id']})")
    return job

def run_job(token: str, job_id: int) -> bool:
    """Run a job and wait for completion"""
    headers = {"Authorization": f"Bearer {token}"}
    
    # Trigger run
    response = requests.post(
        f"{API_BASE}/jobs/{job_id}/run",
        headers=headers
    )
    if response.status_code != 200:
        print(f"❌ Failed to run job {job_id}: {response.text}")
        return False
    
    print(f"🔄 Running job {job_id}...", end="", flush=True)
    
    # Wait for completion (check status every 2 seconds, max 30 seconds)
    for _ in range(15):
        time.sleep(2)
        response = requests.get(
            f"{API_BASE}/jobs/{job_id}",
            headers=headers
        )
        if response.status_code == 200:
            job = response.json()
            status = job.get("status", "unknown")
            if status == "completed":
                print(" ✅ Completed!")
                return True
            elif status == "failed":
                print(" ❌ Failed!")
                return False
            print(".", end="", flush=True)
    
    print(" ⏱️ Timeout (but job may still be running)")
    return False

def main():
    print("🚀 DataFlow Control - Job Creator & Runner")
    print("=" * 50)
    
    # Get credentials
    email = input("Enter your email: ").strip()
    password = input("Enter your password: ").strip()
    
    # Login
    token = login(email, password)
    
    # Define jobs to create
    jobs_to_create = [
        {
            "name": "Scrape Hacker News",
            "description": "Daily scrape of Hacker News homepage",
            "type": "scraper",
            "schedule": "0 9 * * *",  # Every day at 9 AM
            "configuration": {
                "url": "https://news.ycombinator.com"
            }
        },
        {
            "name": "Scrape GitHub Trending",
            "description": "Scrape GitHub trending repositories",
            "type": "scraper",
            "schedule": None,
            "configuration": {
                "url": "https://github.com/trending"
            }
        },
        {
            "name": "Scrape Quotes Site",
            "description": "Scrape inspirational quotes",
            "type": "scraper",
            "schedule": None,
            "configuration": {
                "url": "https://quotes.toscrape.com"
            }
        },
        {
            "name": "Data Processing Task",
            "description": "Custom data processing job",
            "type": "custom",
            "schedule": None,
            "configuration": {}
        },
        {
            "name": "API Sync Job",
            "description": "Sync data from external API",
            "type": "api_sync",
            "schedule": "0 */6 * * *",  # Every 6 hours
            "configuration": {}
        },
    ]
    
    print("\n📝 Creating jobs...")
    created_jobs = []
    
    for job_data in jobs_to_create:
        job = create_job(token, job_data)
        if job:
            created_jobs.append(job)
        time.sleep(0.5)  # Small delay between creates
    
    print(f"\n✅ Created {len(created_jobs)} jobs")
    
    # Ask if user wants to run them
    run_choice = input("\n🤔 Do you want to run all jobs now? (y/n): ").strip().lower()
    
    if run_choice == 'y':
        print("\n🚀 Running jobs...")
        for job in created_jobs:
            run_job(token, job["id"])
            time.sleep(1)  # Small delay between runs
        
        print("\n✅ All done! Check your dashboard at http://localhost:5173")
        print("📸 You can now take screenshots with real data!")
    else:
        print("\n✅ Jobs created! You can run them manually from the UI.")
        print("📸 Go to http://localhost:5173/jobs to see them")

if __name__ == "__main__":
    main()

