from pydantic import BaseModel, EmailStr
from datetime import date
from typing import Optional


class ProfessionalBase(BaseModel):
    nome: str
    email: EmailStr
    telefone: str
    data_nascimento: date
    cref: str
    descricao: Optional[str] = None
    metodologia: Optional[str] = None
    formacao: Optional[str] = None
    certificados: Optional[str] = None
    especialidades: Optional[str] = None


class ProfessionalCreate(ProfessionalBase):
    senha: str


class ProfessionalResponse(ProfessionalBase):
    id_profissional: int

    class Config:
        from_attributes = True