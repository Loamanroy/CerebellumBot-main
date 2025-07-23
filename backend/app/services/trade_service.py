import ccxt
import asyncio
from typing import Dict, List, Optional, Any
from datetime import datetime
import json
import logging

from .redis_service import redis_service
from ..models.signal import Signal
from ..core.database import get_db

logger = logging.getLogger(__name__)


class TradeService:
    def __init__(self):
        self.exchanges = {}
        self.mock_mode = True  # Start in mock mode for development
        self.mock_orders = {}  # Store mock orders in memory
        self.order_counter = 1
        
    async def initialize_exchanges(self):
        """Initialize exchange connections in sandbox/mock mode"""
        try:
            self.exchanges['binance'] = ccxt.binance({
                'apiKey': 'mock_api_key',
                'secret': 'mock_secret',
                'sandbox': True,  # Use testnet
                'enableRateLimit': True,
            })
            
            self.exchanges['coinbase'] = ccxt.coinbasepro({
                'apiKey': 'mock_api_key',
                'secret': 'mock_secret',
                'sandbox': True,
                'enableRateLimit': True,
            })
            
            logger.info("Exchanges initialized in mock/sandbox mode")
            
        except Exception as e:
            logger.error(f"Failed to initialize exchanges: {e}")
            self.mock_mode = True
    
    async def get_market_data(self, exchange: str, symbol: str) -> Dict:
        """Get current market data for a symbol"""
        try:
            if self.mock_mode or exchange not in self.exchanges:
                return {
                    "symbol": symbol,
                    "price": 50000.0 + (hash(symbol) % 10000),  # Mock price based on symbol
                    "bid": 49950.0,
                    "ask": 50050.0,
                    "volume": 1000000.0,
                    "timestamp": datetime.utcnow().isoformat(),
                    "exchange": exchange
                }
            
            exchange_client = self.exchanges[exchange]
            ticker = await exchange_client.fetch_ticker(symbol)
            
            return {
                "symbol": symbol,
                "price": ticker['last'],
                "bid": ticker['bid'],
                "ask": ticker['ask'],
                "volume": ticker['baseVolume'],
                "timestamp": datetime.utcnow().isoformat(),
                "exchange": exchange
            }
            
        except Exception as e:
            logger.error(f"Failed to get market data for {symbol} on {exchange}: {e}")
            return {
                "symbol": symbol,
                "price": 50000.0,
                "bid": 49950.0,
                "ask": 50050.0,
                "volume": 1000000.0,
                "timestamp": datetime.utcnow().isoformat(),
                "exchange": exchange,
                "error": str(e)
            }
    
    async def place_order(self, exchange: str, symbol: str, side: str, amount: float, price: Optional[float] = None) -> Dict:
        """Place a trading order (mock implementation)"""
        try:
            order_id = f"mock_order_{self.order_counter}"
            self.order_counter += 1
            
            order = {
                "id": order_id,
                "exchange": exchange,
                "symbol": symbol,
                "side": side,  # 'buy' or 'sell'
                "amount": amount,
                "price": price,
                "type": "market" if price is None else "limit",
                "status": "pending",
                "timestamp": datetime.utcnow().isoformat(),
                "filled": 0.0,
                "remaining": amount,
                "cost": 0.0
            }
            
            self.mock_orders[order_id] = order
            
            asyncio.create_task(self._process_mock_order(order_id))
            
            logger.info(f"Mock order placed: {order_id} - {side} {amount} {symbol} on {exchange}")
            
            return {
                "success": True,
                "order_id": order_id,
                "status": "pending",
                "message": f"Mock order placed successfully"
            }
            
        except Exception as e:
            logger.error(f"Failed to place order: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to place order"
            }
    
    async def _process_mock_order(self, order_id: str):
        """Simulate order processing and filling"""
        await asyncio.sleep(2)  # Simulate processing delay
        
        if order_id in self.mock_orders:
            order = self.mock_orders[order_id]
            
            order["status"] = "filled"
            order["filled"] = order["amount"]
            order["remaining"] = 0.0
            order["cost"] = order["amount"] * (order["price"] or 50000.0)
            
            await redis_service.publish_signal("order_updates", {
                "order_id": order_id,
                "status": "filled",
                "timestamp": datetime.utcnow().isoformat()
            })
            
            logger.info(f"Mock order filled: {order_id}")
    
    async def get_order_status(self, exchange: str, order_id: str) -> Dict:
        """Get order status"""
        try:
            if order_id in self.mock_orders:
                return {
                    "success": True,
                    "order": self.mock_orders[order_id]
                }
            
            return {
                "success": False,
                "error": "Order not found",
                "message": f"Order {order_id} not found"
            }
            
        except Exception as e:
            logger.error(f"Failed to get order status: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to get order status"
            }
    
    async def cancel_order(self, exchange: str, order_id: str) -> Dict:
        """Cancel an order"""
        try:
            if order_id in self.mock_orders:
                order = self.mock_orders[order_id]
                if order["status"] == "pending":
                    order["status"] = "cancelled"
                    
                    await redis_service.publish_signal("order_updates", {
                        "order_id": order_id,
                        "status": "cancelled",
                        "timestamp": datetime.utcnow().isoformat()
                    })
                    
                    logger.info(f"Mock order cancelled: {order_id}")
                    
                    return {
                        "success": True,
                        "message": f"Order {order_id} cancelled successfully"
                    }
                else:
                    return {
                        "success": False,
                        "error": "Cannot cancel order",
                        "message": f"Order {order_id} is {order['status']} and cannot be cancelled"
                    }
            
            return {
                "success": False,
                "error": "Order not found",
                "message": f"Order {order_id} not found"
            }
            
        except Exception as e:
            logger.error(f"Failed to cancel order: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to cancel order"
            }
    
    async def get_portfolio_balance(self, exchange: str) -> Dict:
        """Get portfolio balance (mock implementation)"""
        try:
            return {
                "success": True,
                "exchange": exchange,
                "balances": {
                    "BTC": {"free": 0.5, "used": 0.1, "total": 0.6},
                    "ETH": {"free": 10.0, "used": 2.0, "total": 12.0},
                    "USDT": {"free": 50000.0, "used": 10000.0, "total": 60000.0},
                },
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Failed to get portfolio balance: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "Failed to get portfolio balance"
            }


trade_service = TradeService()
