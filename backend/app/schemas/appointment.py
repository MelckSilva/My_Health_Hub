from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class AppointmentBase(BaseModel):
    id_usuario: int
    id_servico: int
    data_hora: datetime
    status: Optional[str] = None


class AppointmentCreate(AppointmentBase):
    pass


class AppointmentResponse(AppointmentBase):
    id_agendamento: int

    class Config:
        from_attributes = True