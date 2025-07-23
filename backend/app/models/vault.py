from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text
from sqlalchemy.sql import func
from ..core.database import Base


class Vault(Base):
    __tablename__ = "vaults"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    total_value = Column(Float, default=0.0)
    available_capacity = Column(Float, default=0.0)
    min_investment = Column(Float, default=1000.0)
    max_investment = Column(Float, default=100000.0)
    performance_fee = Column(Float, default=0.2)  # 20% performance fee
    management_fee = Column(Float, default=0.02)  # 2% annual management fee
    strategy_type = Column(String, default="market_making")  # market_making, arbitrage, trend_following
    risk_level = Column(String, default="medium")  # low, medium, high
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Investor(Base):
    __tablename__ = "investors"

    id = Column(Integer, primary_key=True, index=True)
    wallet_address = Column(String, nullable=False, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    total_invested = Column(Float, default=0.0)
    total_profit = Column(Float, default=0.0)
    risk_tolerance = Column(String, default="medium")  # low, medium, high
    kyc_status = Column(String, default="pending")  # pending, approved, rejected
    is_accredited = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Investment(Base):
    __tablename__ = "investments"

    id = Column(Integer, primary_key=True, index=True)
    investor_id = Column(Integer, nullable=False, index=True)
    vault_id = Column(Integer, nullable=False, index=True)
    amount = Column(Float, nullable=False)
    token = Column(String, nullable=False)  # ETH, USDT, etc.
    transaction_hash = Column(String, unique=True, index=True)
    status = Column(String, default="pending")  # pending, confirmed, failed
    entry_price = Column(Float)
    current_value = Column(Float)
    profit_loss = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class WithdrawalRequest(Base):
    __tablename__ = "withdrawal_requests"

    id = Column(Integer, primary_key=True, index=True)
    investor_id = Column(Integer, nullable=False, index=True)
    investment_id = Column(Integer, nullable=False, index=True)
    amount = Column(Float, nullable=False)
    withdrawal_address = Column(String, nullable=False)
    status = Column(String, default="pending")  # pending, processing, completed, failed
    transaction_hash = Column(String, unique=True, index=True)
    processing_fee = Column(Float, default=0.0)
    reason = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    processed_at = Column(DateTime(timezone=True))
