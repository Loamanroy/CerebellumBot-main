from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func
from ..core.database import Base


class Log(Base):
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    bot_id = Column(String)
    exchange = Column(String)
    action = Column(String)
    status = Column(String)
    log_metadata = Column(Text)
