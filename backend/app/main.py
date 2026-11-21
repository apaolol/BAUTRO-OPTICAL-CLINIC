from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import dashboard
from app.routers import Patient
from app.routers import Billing
from app.routers import Inventory
from app.routers import Prescription
from contextlib import asynccontextmanager
from app.database import create_db_and_tables, engine
from app import models  # Register all six tables before startup creates metadata.


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(title="Bautro Optical Clinic", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500", "http://localhost:5500"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(dashboard.router)
app.include_router(Billing.router)
app.include_router(Inventory.router)
app.include_router(Prescription.router)
app.include_router(Patient.router)


@app.get("/")
async def root():
    return {"message": "Bautro Optical Clinic API"}
