# DataFlow Control – Automation & Data Pipeline Dashboard

> **Enterprise-grade orchestration platform for data pipelines, scrapers, and ETL jobs**

A full-stack platform to orchestrate, monitor, and analyze data pipelines (web scrapers, PDF processors, ETL jobs, API syncs). Built with modern best practices, featuring real-time monitoring, scheduling, run history, and role-based access control.

![Tech Stack](https://img.shields.io/badge/Backend-FastAPI-blue) ![Tech Stack](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-blue) ![Tech Stack](https://img.shields.io/badge/Database-PostgreSQL-blue) ![Tech Stack](https://img.shields.io/badge/Queue-Celery%20%2B%20Redis-blue)

---

## 🎯 Key Features

### **Job & Pipeline Management**

- **Create & Schedule Jobs**: Define cron-based jobs (scrapers, PDF processors, API syncs, custom scripts)
- **Pipeline Orchestration**: Chain multiple jobs into pipelines with dependency management
- **Manual & Scheduled Execution**: Trigger jobs on-demand or via cron schedules
- **Run History & Logs**: Complete audit trail with live log streaming via WebSockets

### **Real-Time Monitoring**

- **Live Dashboard**: Real-time metrics (total jobs, active pipelines, today's runs, failure rate)
- **Run History Visualization**: 7-day trend charts showing success vs failure rates
- **WebSocket Updates**: Live status updates without page refresh
- **Job Detail Views**: Per-job run history with timestamps, duration, exit codes, and logs

### **Enterprise Features**

- **JWT Authentication**: Secure access tokens with refresh token support
- **Role-Based Access Control (RBAC)**: Admin, Developer, and Viewer roles
- **User Management**: Full CRUD for user accounts with role assignment
- **API-First Design**: RESTful API with OpenAPI/Swagger documentation

### **Production-Ready Architecture**

- **Background Workers**: Celery workers for async job execution
- **Task Queue**: Redis-backed message queue for reliable job processing
- **Database Migrations**: Alembic for schema versioning
- **Docker Compose**: One-command deployment for all services
- **Type Safety**: Full TypeScript + Pydantic type hints throughout

---

## 🏗️ Architecture

### **Backend** (`backend/`)

- **FastAPI** – High-performance async API framework
- **SQLModel** – Type-safe ORM with Pydantic integration
- **PostgreSQL** – Production-grade relational database
- **Celery + Redis** – Distributed task queue
- **Alembic** – Database migrations
- **WebSockets** – Real-time bidirectional communication

### **Frontend** (`frontend/`)

- **React 19** – Modern UI library
- **TypeScript** – Type-safe frontend code
- **Tailwind CSS** – Utility-first styling
- **React Router** – Client-side routing
- **Axios** – HTTP client with interceptors
- **Custom Hooks** – Reusable WebSocket and API hooks

### **DevOps**

- **Docker Compose** – Multi-container orchestration
- **PostgreSQL** – Database container
- **Redis** – Cache & message broker
- **Uvicorn** – ASGI server with hot reload

---

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- (Optional) Node.js 18+ and Python 3.11+ for local development

### Run with Docker

```bash
# Clone the repository
git clone <your-repo-url>
cd DataFlow-Control-Automation-Data-Pipeline-Dashboard

# Start all services
docker compose up --build

# Services will be available at:
# - Backend API: http://localhost:8000
# - Frontend: http://localhost:5173
# - API Docs: http://localhost:8000/docs
```

### Local Development

**Backend:**

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

---

## 📊 API Endpoints

### Authentication

- `POST /api/v1/auth/login` – Get access token
- `POST /api/v1/auth/test-token` – Validate token

### Jobs

- `GET /api/v1/jobs/` – List all jobs
- `POST /api/v1/jobs/` – Create new job
- `GET /api/v1/jobs/{id}` – Get job details
- `POST /api/v1/jobs/{id}/run` – Trigger job execution
- `GET /api/v1/jobs/{id}/runs` – Get job run history

### Pipelines

- `GET /api/v1/pipelines/` – List all pipelines
- `POST /api/v1/pipelines/` – Create new pipeline
- `GET /api/v1/pipelines/{id}` – Get pipeline details
- `POST /api/v1/pipelines/{id}/run` – Trigger pipeline execution

### Dashboard

- `GET /api/v1/dashboard/summary` – Get dashboard metrics
- `GET /api/v1/dashboard/runs-per-day` – Get time-series data

### WebSockets

- `WS /api/v1/ws/dashboard` – Live dashboard updates
- `WS /api/v1/ws/jobs/{id}/logs` – Live job logs

**Full API Documentation:** Visit `http://localhost:8000/docs` when running locally.

---

## 🎨 Screenshots

_Add screenshots here:_

- Dashboard overview with metrics cards and charts
- Jobs list with status badges and actions
- Job detail page with run history table
- Pipeline management interface
- Live logs streaming view

---

## 🧪 Testing

```bash
# Backend tests (when implemented)
cd backend
pytest

# Frontend tests (when implemented)
cd frontend
npm test
```

---

## 📝 Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/    # REST API endpoints
│   │   ├── core/                 # Config, DB, security
│   │   ├── models/               # SQLModel database models
│   │   ├── schemas/              # Pydantic schemas
│   │   ├── services/             # Business logic (scheduler)
│   │   └── worker/               # Celery tasks
│   ├── alembic/                  # Database migrations
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── features/             # Feature-based pages
│   │   ├── components/           # Reusable components
│   │   ├── hooks/                # Custom React hooks
│   │   └── lib/                  # API client, utilities
│   └── package.json
└── docker-compose.yml
```

---

## 🛠️ Tech Stack Summary

| Layer                 | Technology                |
| --------------------- | ------------------------- |
| **Backend Framework** | FastAPI                   |
| **Database**          | PostgreSQL (SQLModel ORM) |
| **Task Queue**        | Celery + Redis            |
| **Frontend**          | React 19 + TypeScript     |
| **Styling**           | Tailwind CSS              |
| **Real-Time**         | WebSockets (FastAPI)      |
| **Auth**              | JWT (python-jose)         |
| **Deployment**        | Docker + Docker Compose   |

---

## 🎯 Use Cases

- **Web Scraping Orchestration**: Schedule and monitor web scraping jobs
- **ETL Pipelines**: Extract, transform, and load data workflows
- **PDF Processing**: Automated PDF extraction and processing
- **API Synchronization**: Periodic API data sync jobs
- **Custom Script Execution**: Run any Python script on a schedule

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2025 Mohammad Afsharfar

---

## 👤 Author

**Mohammad Afsharfar**

- Portfolio: https://nimastudio.site
- GitHub: [@ne3mer](https://github.com/ne3mer)
- Email: [ne3mer@gmail.com]

---

## 🙏 Acknowledgments

Built with:

- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://react.dev/)
- [Celery](https://docs.celeryq.dev/)
- [SQLModel](https://sqlmodel.tiangolo.com/)
