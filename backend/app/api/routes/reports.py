from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from datetime import datetime, timedelta

from ...core.database import get_db
from ...models.strategy import Strategy
from ...models.signal import Signal
from ...models.log import Log

router = APIRouter()


@router.get("/dashboard")
async def get_dashboard_stats(
    user_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Strategy)
    if user_id:
        query = query.filter(Strategy.user_id == user_id)
    
    total_strategies = query.count()
    active_strategies = query.filter(Strategy.state == "active").count()
    total_pnl = query.with_entities(func.sum(Strategy.pnl)).scalar() or 0.0
    
    recent_signals = db.query(Signal).filter(
        Signal.timestamp >= datetime.utcnow() - timedelta(hours=24)
    ).count()
    
    return {
        "total_strategies": total_strategies,
        "active_strategies": active_strategies,
        "total_pnl": total_pnl,
        "recent_signals_24h": recent_signals,
        "timestamp": datetime.utcnow()
    }


@router.get("/performance")
async def get_performance_report(
    user_id: Optional[int] = None,
    days: int = 30,
    db: Session = Depends(get_db)
):
    start_date = datetime.utcnow() - timedelta(days=days)
    
    query = db.query(Strategy)
    if user_id:
        query = query.filter(Strategy.user_id == user_id)
    
    strategies = query.filter(Strategy.created_at >= start_date).all()
    
    performance_data = []
    for strategy in strategies:
        performance_data.append({
            "strategy_id": strategy.id,
            "name": strategy.name,
            "market": strategy.market,
            "pnl": strategy.pnl,
            "state": strategy.state,
            "created_at": strategy.created_at
        })
    
    return {
        "period_days": days,
        "strategies": performance_data,
        "total_pnl": sum(s["pnl"] for s in performance_data),
        "generated_at": datetime.utcnow()
    }


@router.get("/signals/analytics")
async def get_signal_analytics(
    exchange: Optional[str] = None,
    symbol: Optional[str] = None,
    hours: int = 24,
    db: Session = Depends(get_db)
):
    start_time = datetime.utcnow() - timedelta(hours=hours)
    
    query = db.query(Signal).filter(Signal.timestamp >= start_time)
    
    if exchange:
        query = query.filter(Signal.exchange == exchange)
    if symbol:
        query = query.filter(Signal.symbol == symbol)
    
    signals = query.all()
    
    signal_types = {}
    confidence_avg = 0.0
    
    for signal in signals:
        signal_types[signal.signal_type] = signal_types.get(signal.signal_type, 0) + 1
        confidence_avg += signal.confidence
    
    if signals:
        confidence_avg /= len(signals)
    
    return {
        "period_hours": hours,
        "total_signals": len(signals),
        "signal_types": signal_types,
        "average_confidence": confidence_avg,
        "exchange": exchange,
        "symbol": symbol,
        "generated_at": datetime.utcnow()
    }


@router.get("/logs")
async def get_system_logs(
    skip: int = 0,
    limit: int = 100,
    bot_id: Optional[str] = None,
    exchange: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Log)
    
    if bot_id:
        query = query.filter(Log.bot_id == bot_id)
    if exchange:
        query = query.filter(Log.exchange == exchange)
    
    logs = query.order_by(Log.timestamp.desc()).offset(skip).limit(limit).all()
    
    return {
        "logs": [
            {
                "id": log.id,
                "timestamp": log.timestamp,
                "bot_id": log.bot_id,
                "exchange": log.exchange,
                "action": log.action,
                "status": log.status,
                "metadata": log.log_metadata
            }
            for log in logs
        ]
    }
