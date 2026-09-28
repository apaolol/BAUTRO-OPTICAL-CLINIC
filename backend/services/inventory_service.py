from sqlalchemy.orm import Session
from models.orm import Inventory
from utils.ids import generate_code

def get_all_items(db: Session):
    return db.query(Inventory).all()

def add_item(db: Session, data):
    count = db.query(Inventory).count()
    item_code = generate_code("ITM", count)
    
    new_item = Inventory(
        item_code=item_code,
        brand=data.brand,
        model=data.model,
        category=data.category,
        quantity=data.quantity,
        reorder_level=data.reorder_level,
        cost=data.cost,
        selling_price=data.selling_price,
        supplier=data.supplier
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return {"item_code": new_item.item_code}

def update_item_quantity(db: Session, item_code: str, added_quantity: int):
    item = db.query(Inventory).filter(Inventory.item_code == item_code).first()
    if item:
        item.quantity += added_quantity
        db.commit()
        return {"item_code": item.item_code, "new_quantity": item.quantity}
    return {"error": "Not found"}
