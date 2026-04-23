from sqlalchemy import Column, Integer, String, Date, Float
from app.core.database import Base


class User(Base):
    __tablename__ = "usuario"

    id_usuario = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nome = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    senha = Column(String(255), nullable=False)
    telefone = Column(String(20), unique=True, nullable=False)
    data_nascimento = Column(Date, nullable=False)
    cpf = Column(String(14), unique=True, nullable=False)
    objetivo = Column(String(100), nullable=True)
    peso = Column(Float, nullable=True)
    altura = Column(Float, nullable=True)
    nivel = Column(String(20), nullable=True)
    preferencia_atendimento = Column(String(20), nullable=True)