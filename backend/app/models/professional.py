from sqlalchemy import Column, Integer, String, Date, Text
from app.core.database import Base

class Profissional(Base):
    __tablename__ = "profissional"

    id_profissional = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nome = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    senha = Column(String(255), nullable=False)
    telefone = Column(String(20), nullable=False)
    data_nascimento = Column(Date, nullable=False)
    cref = Column(String(50), nullable=False)
    descricao = Column(Text, nullable=True)
    metodologia = Column(Text, nullable=True)
    formacao = Column(Text, nullable=True)
    certificados = Column(Text, nullable=True)
    especialidades = Column(Text, nullable=True)