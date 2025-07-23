from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import psycopg

from .core.database import engine, Base
from .core.config import settings
from .services.ai_service import ai_service
from .services.trade_service import trade_service
from .api.routes import auth, signals, strategies, reports, requests, wallet, trade

app = FastAPI(
    title=settings.app_name,
    description="CerebellumBot Platform - Intelligent Liquidity Protocol",
    version="1.0.0"
)

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

Base.metadata.create_all(bind=engine)

app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(signals.router, prefix="/api/signals", tags=["signals"])
app.include_router(strategies.router, prefix="/api/strategies", tags=["strategies"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])
app.include_router(requests.router, prefix="/api/requests", tags=["requests"])
app.include_router(wallet.router, prefix="/api/wallet", tags=["wallet"])
app.include_router(trade.router, prefix="/api/trade", tags=["trade"])

@app.on_event("startup")
async def startup_event():
    await ai_service.initialize()
    await ai_service.seed_initial_signals(100)
    await trade_service.initialize_exchanges()

@app.on_event("shutdown")
async def shutdown_event():
    await ai_service.shutdown()

@app.get("/healthz")
async def healthz():
    return {"status": "ok", "app": settings.app_name}

@app.get("/")
async def root():
    return {
        "message": "CerebellumBot Platform API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/healthz"
    }

@app.get("/api/config/white-label")
async def get_white_label_config():
    return {
        "brand_name": settings.brand_name,
        "primary_color": settings.primary_color,
        "secondary_color": settings.secondary_color,
        "accent_color": settings.accent_color
    }
