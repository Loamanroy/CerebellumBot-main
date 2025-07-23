from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from ..core.database import Base


class DemoRequest(Base):
    __tablename__ = "demo_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    telegram = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class InvestorRequest(Base):
    __tablename__ = "investor_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    expected_investment = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
