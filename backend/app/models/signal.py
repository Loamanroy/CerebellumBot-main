from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.sql import func
from ..core.database import Base


class Signal(Base):
    __tablename__ = "signals"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    exchange = Column(String)
    symbol = Column(String)
    signal_type = Column(String)
    confidence = Column(Float)
    price = Column(Float)
    volume = Column(Float)
    signal_metadata = Column(Text)
