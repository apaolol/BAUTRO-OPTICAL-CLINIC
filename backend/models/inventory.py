from pydantic import BaseModel


class InventoryCreate(BaseModel):
    category: str
    brand: str
    model: str
    color: str
    supplier: str

    purchase_cost: float
    selling_price: float

    quantity: int
    reorder_level: int