from typing import List

import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlmodel import Session

from celery.result import AsyncResult

from app.core.db import engine
from app.models.job import Job
from app.models.run import JobRun
from app.worker.celery_app import celery_app

router = APIRouter()


class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str) -> None:
        for connection in self.active_connections:
            await connection.send_text(message)


manager = ConnectionManager()


@router.websocket("/jobs/{job_id}/logs")
async def websocket_endpoint(websocket: WebSocket, job_id: int) -> None:
    await manager.connect(websocket)
    try:
        # Create a new session for the websocket connection
        task_id: str | None = None
        with Session(engine) as session:
            job = session.get(Job, job_id)
            if job and job.last_celery_task_id:
                task_id = job.last_celery_task_id
            else:
                # No active task, but we can stream the latest JobRun logs if present
                last_run = (
                    session.query(JobRun)  # type: ignore[attr-defined]
                    .filter(JobRun.job_id == job_id)
                    .order_by(JobRun.started_at.desc())
                    .first()
                )
                if last_run and last_run.logs:
                    await websocket.send_text(last_run.logs)
                else:
                    await websocket.send_text(f"Job {job_id}: No active task found.")
                # Keep connection open but don't poll task status
                while True:
                    await asyncio.sleep(10)

        if not task_id:
            return

        while True:
            result = AsyncResult(task_id, app=celery_app)
            status = result.status

            if status == "SUCCESS":
                output = result.result
                await websocket.send_text(f"Task Finished: {output}")
                break
            if status == "FAILURE":
                await websocket.send_text(f"Task Failed: {result.result}")
                break
            if status == "PENDING":
                await websocket.send_text("Task Pending...")
            elif status == "STARTED":
                await websocket.send_text("Task Started...")
            else:
                await websocket.send_text(f"Task Status: {status}")

            await asyncio.sleep(1)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:  # pragma: no cover - defensive logging
        print(f"WebSocket Error: {e}")
        try:
            await websocket.send_text(f"Error: {str(e)}")
        except:
            pass
        manager.disconnect(websocket)


@router.websocket("/dashboard")
async def dashboard_websocket(websocket: WebSocket) -> None:
    await manager.connect(websocket)
    try:
        while True:
            await asyncio.sleep(5)
            # Lightweight realtime metrics: mirror the REST summary endpoint.
            with Session(engine) as session:
                total_jobs = session.query(Job).count()  # type: ignore[attr-defined]
                active_pipelines = (
                    session.query(Job)  # placeholder, keep WS simple
                    .filter(Job.status == JobStatus.RUNNING)  # type: ignore[name-defined]
                    .count()
                )

            data = {
                "total_jobs": total_jobs,
                "active_pipelines": active_pipelines,
                "todays_runs": 0,  # detailed breakdown comes from REST
                "failure_rate": 0.0,
            }
            await websocket.send_json(data)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
