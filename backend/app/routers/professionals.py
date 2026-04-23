from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.professional import Profissional

router = APIRouter(prefix="/professionals", tags=["Professionals"])

@router.get("/")
def list_professionals(db: Session = Depends(get_db)):
    profissionais = db.query(Profissional).all()
    return profissionais