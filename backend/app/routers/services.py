from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.service import Servico
from app.schemas.service import ServiceResponse
from typing import List

router = APIRouter(prefix="/services", tags=["Services"])


@router.get("/", response_model=List[ServiceResponse])
def list_services(db: Session = Depends(get_db)):
    services = db.query(Servico).all()
    return services