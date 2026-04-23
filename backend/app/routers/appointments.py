from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.appointment import Agendamento

router = APIRouter(prefix="/appointments", tags=["Appointments"])


@router.get("/")
def list_appointments(db: Session = Depends(get_db)):
    agendamentos = db.query(Agendamento).all()
    return agendamentos