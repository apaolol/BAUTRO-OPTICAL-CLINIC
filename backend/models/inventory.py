from pydantic import BaseModel
from typing import Optional

class InventoryCreate(BaseModel):
    category: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    supplier: Optional[str] = None
    cost: Optional[float] = 0.0
    selling_price: Optional[float] = 0.0
    quantity: Optional[int] = 0
    reorder_level: Optional[int] = 5