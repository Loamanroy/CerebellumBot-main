from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from ...core.database import get_db
from ...models.strategy import Strategy
from ...models.user import User

router = APIRouter()


@router.get("/")
async def get_strategies(
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Strategy)
    
    if user_id:
        query = query.filter(Strategy.user_id == user_id)
    
    strategies = query.offset(skip).limit(limit).all()
    
    return {
        "strategies": [
            {
                "id": strategy.id,
                "user_id": strategy.user_id,
                "name": strategy.name,
                "market": strategy.market,
                "state": strategy.state,
                "pnl": strategy.pnl,
                "config": strategy.config,
                "created_at": strategy.created_at,
                "updated_at": strategy.updated_at
            }
            for strategy in strategies
        ]
    }


@router.post("/")
async def create_strategy(
    user_id: int,
    name: str,
    market: str,
    config: Optional[str] = None,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    strategy = Strategy(
        user_id=user_id,
        name=name,
        market=market,
        config=config
    )
    
    db.add(strategy)
    db.commit()
    db.refresh(strategy)
    
    return {
        "message": "Strategy created successfully",
        "strategy_id": strategy.id
    }


@router.get("/{strategy_id}")
async def get_strategy(strategy_id: int, db: Session = Depends(get_db)):
    strategy = db.query(Strategy).filter(Strategy.id == strategy_id).first()
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")
    
    return {
        "id": strategy.id,
        "user_id": strategy.user_id,
        "name": strategy.name,
        "market": strategy.market,
        "state": strategy.state,
        "pnl": strategy.pnl,
        "config": strategy.config,
        "created_at": strategy.created_at,
        "updated_at": strategy.updated_at
    }


@router.put("/{strategy_id}")
async def update_strategy(
    strategy_id: int,
    name: Optional[str] = None,
    market: Optional[str] = None,
    state: Optional[str] = None,
    config: Optional[str] = None,
    db: Session = Depends(get_db)
):
    strategy = db.query(Strategy).filter(Strategy.id == strategy_id).first()
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")
    
    if name:
        strategy.name = name
    if market:
        strategy.market = market
    if state:
        strategy.state = state
    if config:
        strategy.config = config
    
    db.commit()
    db.refresh(strategy)
    
    return {
        "message": "Strategy updated successfully",
        "strategy_id": strategy.id
    }


@router.delete("/{strategy_id}")
async def delete_strategy(strategy_id: int, db: Session = Depends(get_db)):
    strategy = db.query(Strategy).filter(Strategy.id == strategy_id).first()
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")
    
    db.delete(strategy)
    db.commit()
    
    return {"message": "Strategy deleted successfully"}
