from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/")
def list_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users