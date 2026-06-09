from pydantic import BaseModel
from typing import Optional


class ServiceBase(BaseModel):
    id_profissional: int
    titulo: str
    descricao: Optional[str] = None
    preco: float
    tipo: Optional[str] = None
    categoria: Optional[str] = None


class ServiceCreate(ServiceBase):
    pass


class ServiceResponse(ServiceBase):
    id_servico: int

    class Config:
        from_attributes = True