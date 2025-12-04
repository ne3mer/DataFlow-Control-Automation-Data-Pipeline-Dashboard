from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from contextlib import asynccontextmanager
from app.core.db import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(
    title="DataFlow Control",
    description="Automation & Data Pipeline Dashboard API",
    version="0.1.0",
    lifespan=lifespan,
    contact={
        "name": "Mohammad Afsharfar",
        "email": "your.email@example.com",  # Update with your email
    },
)

origins = [
    "http://localhost",
    "http://localhost:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.core.config import settings
from app.api.v1.api import api_router

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {"message": "Welcome to DataFlow Control API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
