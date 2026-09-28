from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from services.inventory_service import get_all_items, add_item, update_item_quantity
from database import get_db
from models.inventory import InventoryCreate

router = APIRouter()

@router.get("/")
def list_inventory(db: Session = Depends(get_db)):
    return get_all_items(db)

@router.post("/")
def create_item(payload: InventoryCreate, db: Session = Depends(get_db)):
    return add_item(db, payload)

@router.put("/{item_code}")
def restock_item(item_code: str, quantity: int, db: Session = Depends(get_db)):
    return update_item_quantity(db, item_code, quantity)
