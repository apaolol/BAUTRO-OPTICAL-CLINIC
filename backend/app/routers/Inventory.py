from fastapi import APIRouter
from app.models.Inventory import Inventory, InventoryCreate
from app.internal.ids import generate_code
from sqlmodel import Session, func, select

router = APIRouter(prefix="/inventory", tags=["Inventory"])
from ..database import engine

@router.get("/", summary="Get all Inventory")
async def get_all():
    with Session(engine) as session:
        statement = select(Inventory)
        results = session.exec(statement).all()
        return results



@router.post("/", summary="Create a new Inventory")
async def create_item(payload: InventoryCreate):
    with Session(engine) as session:
        count = session.exec(select(func.count()).select_from(Inventory)).one()
        item = Inventory(**payload.model_dump(), item_code=generate_code("ITM", count))
        session.add(item)
        session.commit()
        session.refresh(item)
        return {"item_code": item.item_code}


@router.put("/{item_code}", summary="Restock Inventory by item code")
async def restock_item(item_code: str, quantity: int):
    with Session(engine) as session:
        statement = select(Inventory).where(Inventory.item_code == item_code)
        item = session.exec(statement).first()
        if item:
            item.quantity += quantity
            session.commit()
            session.refresh(item)
            return {"item_code": item.item_code, "new_quantity": item.quantity}
        return {"error": "Not found"}
