from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.service import Servico

router = APIRouter(prefix="/services", tags=["Services"])


@router.get("/")
def list_services(db: Session = Depends(get_db)):
    servicos = db.query(Servico).all()
    return servicos