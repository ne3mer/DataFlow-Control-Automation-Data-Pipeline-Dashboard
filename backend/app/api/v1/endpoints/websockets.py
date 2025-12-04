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

@router.websocket("/jobs/{job_id}/logs")
async def websocket_endpoint(websocket: WebSocket, job_id: int):
    await manager.connect(websocket)
    try:
        while True:
            # Simulate log streaming
            await asyncio.sleep(2)
            await websocket.send_text(f"Log entry for job {job_id}: Process running...")
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@router.websocket("/dashboard")
async def dashboard_websocket(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await asyncio.sleep(5)
            # Simulate metrics update
            data = {
                "total_jobs": 12,
                "active_pipelines": 3,
                "todays_runs": 45, # This could increment
                "failure_rate": 2.5
            }
            await websocket.send_json(data)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
