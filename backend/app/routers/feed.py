from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import FeedType, User
from ..schemas import FeedTypeOut
from ..auth import get_current_user

router = APIRouter(prefix="/feed", tags=["feed"])


@router.get("/types", response_model=list[FeedTypeOut])
def list_feed_types(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Available feed types with current stock (approved only; no reserved deduction until approval)."""
    return db.query(FeedType).all()
