from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.professional import Profissional
from app.schemas.professional import ProfessionalResponse
from typing import List

router = APIRouter(prefix="/professionals", tags=["Professionals"])


@router.get("/", response_model=List[ProfessionalResponse])
def list_professionals(db: Session = Depends(get_db)):
    professionals = db.query(Profissional).all()
    return professionals