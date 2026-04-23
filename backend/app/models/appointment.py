from sqlalchemy import Column, Integer, DateTime, ForeignKey, Enum
from app.core.database import Base


class Agendamento(Base):
    __tablename__ = "agendamento"

    id_agendamento = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_usuario = Column(Integer, ForeignKey("usuario.id_usuario"), nullable=False)
    id_servico = Column(Integer, ForeignKey("servico.id_servico"), nullable=False)
    data_hora = Column(DateTime, nullable=False)
    status = Column(
        Enum("pendente", "confirmado", "cancelado", "concluido"),
        nullable=True
    )