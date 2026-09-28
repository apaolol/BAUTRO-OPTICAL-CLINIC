from sqlalchemy.orm import Session
from models.orm import Patient, Prescription, Inventory, Billing
from sqlalchemy import func
import datetime

def get_dashboard_metrics(db: Session):
    total_patients = db.query(Patient).count()
    total_prescriptions = db.query(Prescription).count()
    total_inventory = db.query(Inventory).count()
    
    today = datetime.date.today()
    
    today_revenue = db.query(func.sum(Billing.amount_paid)).filter(Billing.date == today).scalar() or 0.0
    total_revenue = db.query(func.sum(Billing.amount_paid)).scalar() or 0.0
    
    low_stock_items = db.query(Inventory).filter(Inventory.quantity <= Inventory.reorder_level).all()
    
    return {
        "total_patients": total_patients,
        "total_prescriptions": total_prescriptions,
        "total_inventory_items": total_inventory,
        "today_revenue": float(today_revenue),
        "total_revenue": float(total_revenue),
        "low_stock_count": len(low_stock_items),
        "low_stock_items": low_stock_items
    }
