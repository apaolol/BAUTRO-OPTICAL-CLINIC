from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.patients import router as patient_router
from routes.prescriptions import router as prescription_router
from routes.inventory import router as inventory_router
from routes.billing import router as billing_router
from routes.dashboard import router as dashboard_router

app = FastAPI(
    title="Bautro Optical Clinic",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(patient_router, prefix="/patients", tags=["Patients"])
app.include_router(prescription_router, prefix="/prescriptions", tags=["Prescriptions"])
app.include_router(inventory_router, prefix="/inventory", tags=["Inventory"])
app.include_router(billing_router, prefix="/billing", tags=["Billing"])
app.include_router(dashboard_router, prefix="/dashboard", tags=["Dashboard"])

@app.get("/")
def root():
    return {"message": "Bautro Optical Clinic API"}
