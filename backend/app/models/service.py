from sqlalchemy import Column, Integer, String, Text, Float, ForeignKey
from app.core.database import Base


class Servico(Base):
    __tablename__ = "servico"

    id_servico = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_profissional = Column(Integer, ForeignKey("profissional.id_profissional"), nullable=False)
    titulo = Column(String(100), nullable=False)
    descricao = Column(Text, nullable=True)
    preco = Column(Float, nullable=False)
    tipo = Column(String(20), nullable=True)
    categoria = Column(String(50), nullable=True)