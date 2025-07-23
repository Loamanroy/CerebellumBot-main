from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    app_name: str = "CerebellumBot Platform"
    debug: bool = True
    
    database_url: str = "sqlite:///./cerebellumbot.db"
    
    redis_url: str = "redis://localhost:6379"
    
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    brand_name: str = "CerebellumBot"
    primary_color: str = "#00FFD1"
    secondary_color: str = "#0A0A0A"
    accent_color: str = "#F2F2F2"
    
    paranoia_mode: bool = False
    vpn_enabled: bool = False
    tor_enabled: bool = False
    stealth_mode: bool = False
    
    class Config:
        env_file = ".env"


settings = Settings()
