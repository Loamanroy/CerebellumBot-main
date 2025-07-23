from sqlalchemy import Column, Integer, String, DateTime, Float
from sqlalchemy.sql import func
from ..core.database import Base

class WalletTransaction(Base):
    __tablename__ = "wallet_transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    hash = Column(String, unique=True, nullable=False, index=True)
    from_address = Column(String, nullable=False)
    to_address = Column(String, nullable=False)
    amount = Column(String, nullable=False)  # Store as string to preserve precision
    token = Column(String, nullable=False)  # ETH, USDT, etc.
    network = Column(String, nullable=False, default="ETHEREUM")  # ETHEREUM, TRON, etc.
    status = Column(String, nullable=False, default="pending")  # pending, confirmed, failed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
