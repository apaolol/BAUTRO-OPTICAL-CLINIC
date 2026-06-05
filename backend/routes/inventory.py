from fastapi import APIRouter
from models.inventory import InventoryCreate
from services.inventory_service import (
    get_all_inventory,
    get_inventory_item,
    create_inventory_item,
    update_inventory_quantity,
    get_low_stock,
)
from pydantic import BaseModel
from typing import Optional

router = APIRouter()


class QuantityUpdate(BaseModel):
    quantity_change: int
    action: str  # e.g. "RESTOCK", "SOLD", "ADJUSTMENT"
    remarks: Optional[str] = ""


@router.get("/")
def list_inventory():
    return get_all_inventory()


@router.get("/low-stock")
def list_low_stock():
    return get_low_stock()


@router.get("/{item_code}")
def get_item(item_code: str):
    return get_inventory_item(item_code)


@router.post("/")
def add_item(payload: InventoryCreate):
    return create_inventory_item(payload)


@router.patch("/{item_code}/quantity")
def update_quantity(item_code: str, payload: QuantityUpdate):
    return update_inventory_quantity(
        item_code,
        payload.quantity_change,
        payload.action,
        payload.remarks,
    )