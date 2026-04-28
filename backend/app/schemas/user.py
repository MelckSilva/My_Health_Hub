from pydantic import BaseModel, EmailStr
from datetime import date
from typing import Optional


class UserBase(BaseModel):
    nome: str
    email: EmailStr
    telefone: str
    data_nascimento: date
    cpf: str
    objetivo: Optional[str] = None
    peso: Optional[float] = None
    altura: Optional[float] = None
    nivel: Optional[str] = None
    preferencia_atendimento: Optional[str] = None


class UserCreate(UserBase):
    senha: str


class UserResponse(UserBase):
    id_usuario: int

    class Config:
        from_attributes = True