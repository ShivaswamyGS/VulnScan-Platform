from datetime import datetime

from pydantic import BaseModel, ConfigDict


# =========================================================
# BOOKMARK RESPONSE
# =========================================================

class BookmarkRead(BaseModel):
    id: int
    user_id: int
    program_id: int
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )