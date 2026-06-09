from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.appointment import Agendamento
from app.schemas.appointment import AppointmentResponse
from typing import List

router = APIRouter(prefix="/appointments", tags=["Appointments"])


@router.get("/", response_model=List[AppointmentResponse])
def list_appointments(db: Session = Depends(get_db)):
    appointments = db.query(Agendamento).all()
    return appointments