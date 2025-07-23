from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ...core.database import get_db
from ...models.signal import Signal

router = APIRouter()


@router.get("/")
async def get_signals(
    skip: int = 0,
    limit: int = 100,
    exchange: Optional[str] = None,
    symbol: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Signal)
    
    if exchange:
        query = query.filter(Signal.exchange == exchange)
    if symbol:
        query = query.filter(Signal.symbol == symbol)
    
    signals = query.offset(skip).limit(limit).all()
    
    return {
        "signals": [
            {
                "id": signal.id,
                "timestamp": signal.timestamp,
                "exchange": signal.exchange,
                "symbol": signal.symbol,
                "signal_type": signal.signal_type,
                "confidence": signal.confidence,
                "price": signal.price,
                "volume": signal.volume,
                "metadata": signal.signal_metadata
            }
            for signal in signals
        ]
    }


@router.post("/")
async def create_signal(
    exchange: str,
    symbol: str,
    signal_type: str,
    confidence: float,
    price: float,
    volume: float = 0.0,
    metadata: Optional[str] = None,
    db: Session = Depends(get_db)
):
    signal = Signal(
        exchange=exchange,
        symbol=symbol,
        signal_type=signal_type,
        confidence=confidence,
        price=price,
        volume=volume,
        signal_metadata=metadata
    )
    
    db.add(signal)
    db.commit()
    db.refresh(signal)
    
    return {
        "message": "Signal created successfully",
        "signal_id": signal.id,
        "timestamp": signal.timestamp
    }


@router.get("/{signal_id}")
async def get_signal(signal_id: int, db: Session = Depends(get_db)):
    signal = db.query(Signal).filter(Signal.id == signal_id).first()
    if not signal:
        raise HTTPException(status_code=404, detail="Signal not found")
    
    return {
        "id": signal.id,
        "timestamp": signal.timestamp,
        "exchange": signal.exchange,
        "symbol": signal.symbol,
        "signal_type": signal.signal_type,
        "confidence": signal.confidence,
        "price": signal.price,
        "volume": signal.volume,
        "metadata": signal.signal_metadata
    }


@router.get("/live/stream")
async def get_live_signals():
    return {"message": "Live signal stream endpoint - WebSocket implementation needed"}
