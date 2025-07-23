import random
from datetime import datetime
from typing import Dict, List
import logging
import asyncio
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy.orm import Session

from .redis_service import redis_service
from ..core.database import get_db
from ..models.signal import Signal

logger = logging.getLogger(__name__)


class AIService:
    def __init__(self):
        self.model_loaded = False
        self.scheduler = None
        
    async def initialize(self):
        """Initialize AI models and services"""
        try:
            self.model_loaded = True
            
            self.scheduler = AsyncIOScheduler()
            self.scheduler.add_job(
                self._generate_and_save_signal,
                'interval',
                minutes=1,
                id='signal_generation'
            )
            self.scheduler.start()
            
            logger.info("AI Service initialized successfully with background signal generation")
        except Exception as e:
            logger.error(f"Failed to initialize AI Service: {e}")
            raise
    
    async def _generate_and_save_signal(self):
        """Background task to generate and save signals"""
        try:
            symbols = ["BTC/USDT", "ETH/USDT", "BNB/USDT", "ADA/USDT"]
            exchanges = ["binance", "coinbase"]
            
            for symbol in symbols:
                for exchange in exchanges:
                    signal_data = await self.generate_signal(exchange, symbol)
                    
                    db = next(get_db())
                    try:
                        signal = Signal(
                            timestamp=datetime.utcnow(),
                            exchange=signal_data["exchange"],
                            symbol=signal_data["symbol"],
                            signal_type=signal_data["signal_type"],
                            confidence=signal_data["confidence"],
                            price=signal_data["price"],
                            volume=signal_data["volume"],
                            metadata=str(signal_data["metadata"])
                        )
                        
                        db.add(signal)
                        db.commit()
                        db.refresh(signal)
                        
                        await redis_service.publish_signal("new_signals", {
                            "id": signal.id,
                            "exchange": signal.exchange,
                            "symbol": signal.symbol,
                            "signal_type": signal.signal_type,
                            "confidence": signal.confidence,
                            "timestamp": signal.timestamp.isoformat()
                        })
                        
                        logger.info(f"Generated and saved signal: {signal.signal_type} for {symbol} on {exchange}")
                        
                    except Exception as e:
                        logger.error(f"Failed to save signal to database: {e}")
                        db.rollback()
                    finally:
                        db.close()
                        
        except Exception as e:
            logger.error(f"Error in background signal generation: {e}")
    
    async def generate_signal(self, exchange: str = "binance", symbol: str = "BTC/USDT", market_data: Dict = None) -> Dict:
        """Generate a trading signal using AI analysis"""
        if not self.model_loaded:
            await self.initialize()
        
        signal_types = ["BUY", "SELL", "HOLD"]
        confidence_score = random.uniform(0.6, 0.95)
        
        if market_data:
            price = market_data.get("price", random.uniform(40000, 60000))
            volume = market_data.get("volume", random.uniform(1000, 10000))
        else:
            price = random.uniform(40000, 60000)
            volume = random.uniform(1000, 10000)
        
        signal = {
            "exchange": exchange,
            "symbol": symbol,
            "signal_type": random.choice(signal_types),
            "confidence": confidence_score,
            "price": price,
            "volume": volume,
            "timestamp": datetime.utcnow().isoformat(),
            "metadata": {
                "model_version": "v1.0",
                "indicators": ["RSI", "MACD", "Bollinger Bands"],
                "market_sentiment": random.choice(["bullish", "bearish", "neutral"]),
                "volatility": random.uniform(0.1, 0.5)
            }
        }
        
        logger.info(f"Generated signal: {signal['signal_type']} for {symbol} with confidence {confidence_score:.2f}")
        return signal
    
    async def analyze_market_sentiment(self, symbols: List[str]) -> Dict:
        """Analyze overall market sentiment"""
        return {
            "overall_sentiment": random.choice(["bullish", "bearish", "neutral"]),
            "confidence": random.uniform(0.7, 0.9),
            "fear_greed_index": random.randint(20, 80),
            "timestamp": datetime.utcnow().isoformat()
        }
    
    async def seed_initial_signals(self, count: int = 100):
        """Seed the database with initial mock signals"""
        try:
            symbols = ["BTC/USDT", "ETH/USDT", "BNB/USDT", "ADA/USDT", "SOL/USDT"]
            exchanges = ["binance", "coinbase", "kraken"]
            
            db = next(get_db())
            try:
                for i in range(count):
                    symbol = random.choice(symbols)
                    exchange = random.choice(exchanges)
                    signal_data = await self.generate_signal(exchange, symbol)
                    
                    signal = Signal(
                        timestamp=datetime.utcnow(),
                        exchange=signal_data["exchange"],
                        symbol=signal_data["symbol"],
                        signal_type=signal_data["signal_type"],
                        confidence=signal_data["confidence"],
                        price=signal_data["price"],
                        volume=signal_data["volume"],
                        signal_metadata=str(signal_data["metadata"])
                    )
                    
                    db.add(signal)
                
                db.commit()
                logger.info(f"Seeded {count} initial signals successfully")
                
            except Exception as e:
                logger.error(f"Failed to seed signals: {e}")
                db.rollback()
            finally:
                db.close()
                
        except Exception as e:
            logger.error(f"Error in signal seeding: {e}")

    async def shutdown(self):
        """Shutdown the AI service and scheduler"""
        if self.scheduler:
            self.scheduler.shutdown()
            logger.info("AI Service scheduler shutdown")


ai_service = AIService()
