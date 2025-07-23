import redis.asyncio as redis
from typing import Optional
from ..core.config import settings


class RedisService:
    def __init__(self):
        self.redis_client: Optional[redis.Redis] = None
    
    async def connect(self):
        try:
            self.redis_client = redis.from_url(settings.redis_url)
            await self.redis_client.ping()
            print("Connected to Redis successfully")
        except Exception as e:
            print(f"Failed to connect to Redis: {e}")
            self.redis_client = None
    
    async def disconnect(self):
        if self.redis_client:
            await self.redis_client.close()
    
    async def publish_signal(self, channel: str, message: dict):
        if self.redis_client:
            try:
                await self.redis_client.publish(channel, str(message))
                return True
            except Exception as e:
                print(f"Failed to publish signal: {e}")
                return False
        return False
    
    async def subscribe_to_signals(self, channel: str):
        if self.redis_client:
            try:
                pubsub = self.redis_client.pubsub()
                await pubsub.subscribe(channel)
                return pubsub
            except Exception as e:
                print(f"Failed to subscribe to signals: {e}")
                return None
        return None
    
    async def cache_set(self, key: str, value: str, expire: int = 3600):
        if self.redis_client:
            try:
                await self.redis_client.setex(key, expire, value)
                return True
            except Exception as e:
                print(f"Failed to set cache: {e}")
                return False
        return False
    
    async def cache_get(self, key: str):
        if self.redis_client:
            try:
                value = await self.redis_client.get(key)
                return value.decode() if value else None
            except Exception as e:
                print(f"Failed to get cache: {e}")
                return None
        return None


redis_service = RedisService()
