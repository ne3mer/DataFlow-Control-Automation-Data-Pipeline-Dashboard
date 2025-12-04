# 🚀 Scripts for DataFlow Control

## create_and_run_jobs.py

**این اسکریپت برای ساخت و اجرای چند job نمونه استفاده می‌شه تا بتونی screenshot بگیری.**

### نحوه استفاده:

```bash
# از root directory پروژه:
cd "/Users/nimaafsharfar/programming video's/DataFlow-Control-Automation-Data-Pipeline-Dashboard"

# اجرای اسکریپت:
python3 scripts/create_and_run_jobs.py
```

### چه کار می‌کنه:

1. ازت email و password می‌گیره
2. Login می‌کنه و token می‌گیره
3. 5 تا job مختلف می‌سازه:
   - Scrape Hacker News (scraper)
   - Scrape GitHub Trending (scraper)
   - Scrape Quotes Site (scraper)
   - Data Processing Task (custom)
   - API Sync Job (api_sync)
4. ازت می‌پرسه که می‌خوای همه رو run کنی یا نه
5. اگه بگی بله، همه رو run می‌کنه و صبر می‌کنه تا complete بشن

### بعد از اجرا:

- Dashboard شما پر از داده‌های واقعی می‌شه
- می‌تونی screenshot بگیری
- Run History پر می‌شه
- Chart ها داده نشون می‌دن

---

## نیازمندی‌ها:

- Python 3.11+
- `requests` library: `pip install requests`
- Backend باید در حال اجرا باشه (`docker compose up backend`)
- باید یک user داشته باشی (از طریق UI یا API)

---

## مثال استفاده:

```bash
$ python3 scripts/create_and_run_jobs.py

🚀 DataFlow Control - Job Creator & Runner
==================================================
Enter your email: admin@example.com
Enter your password: ********
✅ Logged in successfully

📝 Creating jobs...
✅ Created job: Scrape Hacker News (ID: 1)
✅ Created job: Scrape GitHub Trending (ID: 2)
✅ Created job: Scrape Quotes Site (ID: 3)
✅ Created job: Data Processing Task (ID: 4)
✅ Created job: API Sync Job (ID: 5)

✅ Created 5 jobs

🤔 Do you want to run all jobs now? (y/n): y

🚀 Running jobs...
🔄 Running job 1... ✅ Completed!
🔄 Running job 2... ✅ Completed!
🔄 Running job 3... ✅ Completed!
🔄 Running job 4... ✅ Completed!
🔄 Running job 5... ✅ Completed!

✅ All done! Check your dashboard at http://localhost:5173
📸 You can now take screenshots with real data!
```

