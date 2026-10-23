from pydantic import BaseModel, ConfigDict, Field


class StatusBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    description: str | None = None
    is_terminal: bool = False
    sort_order: int = 0


class StatusCreate(StatusBase):
    pass


class StatusRead(StatusBase):
    id: int

    model_config = ConfigDict(from_attributes=True)