from sqlmodel import Field, SQLModel


class Inventory(SQLModel, table=True):
    __tablename__ = "inventory"

    id: int | None = Field(default=None, primary_key=True, index=True)
    item_code: str | None = Field(default=None, nullable=True, index=True, unique=True)
    brand: str | None = Field(default=None, nullable=True)
    model: str | None = Field(default=None, nullable=True)
    category: str | None = Field(default=None, nullable=True)
    quantity: int | None = Field(default=0, nullable=True)
    reorder_level: int | None = Field(default=5, nullable=True)
    cost: float | None = Field(default=None, nullable=True)
    selling_price: float | None = Field(default=None, nullable=True)
    supplier: str | None = Field(default=None, nullable=True)


class InventoryCreate(SQLModel):
    category: str | None = None
    brand: str | None = None
    model: str | None = None
    supplier: str | None = None
    cost: float | None = 0.0
    selling_price: float | None = 0.0
    quantity: int | None = 0
    reorder_level: int | None = 5
