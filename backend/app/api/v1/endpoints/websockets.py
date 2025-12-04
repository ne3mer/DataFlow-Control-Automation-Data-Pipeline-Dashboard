from typing import List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import json

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

from celery.result import AsyncResult
from app.worker.celery_app import celery_app
from app.core.db import engine
from sqlmodel import Session
from app.models.job import Job

@router.websocket("/jobs/{job_id}/logs")
async def websocket_endpoint(websocket: WebSocket, job_id: int):
    await manager.connect(websocket)
    try:
        # Create a new session for the websocket connection
        with Session(engine) as session:
            job = session.get(Job, job_id)
            if not job or not job.last_celery_task_id:
                await websocket.send_text(f"Job {job_id}: No active task found.")
                # Keep connection open but don't poll
                while True:
                    await asyncio.sleep(10)
            
            task_id = job.last_celery_task_id
            
        while True:
            result = AsyncResult(task_id, app=celery_app)
            status = result.status
            
            if status == 'SUCCESS':
                output = result.result
                await websocket.send_text(f"Task Finished: {output}")
                break
            elif status == 'FAILURE':
                await websocket.send_text(f"Task Failed: {result.result}")
                break
            elif status == 'PENDING':
                await websocket.send_text(f"Task Pending...")
            elif status == 'STARTED':
                await websocket.send_text(f"Task Started...")
            else:
                await websocket.send_text(f"Task Status: {status}")
            
            await asyncio.sleep(1)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket Error: {e}")
        try:
            await websocket.send_text(f"Error: {str(e)}")
        except:
            pass
        manager.disconnect(websocket)

@router.websocket("/dashboard")
async def dashboard_websocket(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await asyncio.sleep(5)
            # Simulate metrics update (TODO: Fetch real metrics)
            data = {
                "total_jobs": 12,
                "active_pipelines": 3,
                "todays_runs": 45,
                "failure_rate": 2.5
            }
            await websocket.send_json(data)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
