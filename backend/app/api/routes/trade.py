from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import logging

from ...core.database import get_db
from ...services.trade_service import trade_service

logger = logging.getLogger(__name__)

router = APIRouter()

class OrderRequest(BaseModel):
    exchange: str
    symbol: str
    side: str  # 'buy' or 'sell'
    amount: float
    price: Optional[float] = None

class OrderResponse(BaseModel):
    success: bool
    order_id: Optional[str] = None
    status: Optional[str] = None
    message: str
    error: Optional[str] = None

@router.get("/market-data/{exchange}/{symbol}")
async def get_market_data(exchange: str, symbol: str):
    """
    Get current market data for a trading pair
    """
    try:
        data = await trade_service.get_market_data(exchange, symbol)
        return data
    except Exception as e:
        logger.error(f"Error fetching market data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch market data: {str(e)}")

@router.post("/order", response_model=OrderResponse)
async def place_order(order: OrderRequest):
    """
    Place a trading order
    """
    try:
        result = await trade_service.place_order(
            exchange=order.exchange,
            symbol=order.symbol,
            side=order.side,
            amount=order.amount,
            price=order.price
        )
        
        return OrderResponse(
            success=result["success"],
            order_id=result.get("order_id"),
            status=result.get("status"),
            message=result["message"],
            error=result.get("error")
        )
        
    except Exception as e:
        logger.error(f"Error placing order: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to place order: {str(e)}")

@router.get("/order/{order_id}")
async def get_order_status(order_id: str, exchange: str):
    """
    Get order status by ID
    """
    try:
        result = await trade_service.get_order_status(exchange, order_id)
        
        if not result["success"]:
            raise HTTPException(status_code=404, detail=result["message"])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching order status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch order status: {str(e)}")

@router.delete("/order/{order_id}")
async def cancel_order(order_id: str, exchange: str):
    """
    Cancel an order
    """
    try:
        result = await trade_service.cancel_order(exchange, order_id)
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["message"])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error cancelling order: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to cancel order: {str(e)}")

@router.get("/portfolio/{exchange}")
async def get_portfolio_balance(exchange: str):
    """
    Get portfolio balance for an exchange
    """
    try:
        result = await trade_service.get_portfolio_balance(exchange)
        
        if not result["success"]:
            raise HTTPException(status_code=500, detail=result["message"])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching portfolio balance: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch portfolio balance: {str(e)}")
