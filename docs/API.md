# CerebellumBot Platform API Documentation

## Base URL
```
Production: https://api.cerebellumbot.ai
Development: http://localhost:8000
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "secure_password",
  "wallet_address": "0x1234567890abcdef"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user_id": 1
}
```

#### POST /auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "secure_password"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

#### GET /auth/me
Get current user information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "wallet_address": "0x1234567890abcdef",
  "permissions": "user",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Signals

#### GET /signals/
Get list of trading signals.

**Query Parameters:**
- `skip` (int): Number of records to skip (default: 0)
- `limit` (int): Maximum number of records (default: 100)
- `exchange` (string): Filter by exchange
- `symbol` (string): Filter by trading pair

**Response:**
```json
{
  "signals": [
    {
      "id": 1,
      "timestamp": "2024-01-01T12:00:00Z",
      "exchange": "binance",
      "symbol": "BTC/USDT",
      "signal_type": "BUY",
      "confidence": 0.87,
      "price": 45000.0,
      "volume": 1.5,
      "metadata": "{\"source\": \"ai_model_v1\"}"
    }
  ]
}
```

#### POST /signals/
Create a new trading signal.

**Request Body:**
```json
{
  "exchange": "binance",
  "symbol": "BTC/USDT",
  "signal_type": "BUY",
  "confidence": 0.87,
  "price": 45000.0,
  "volume": 1.5,
  "metadata": "{\"source\": \"ai_model_v1\"}"
}
```

**Response:**
```json
{
  "message": "Signal created successfully",
  "signal_id": 1,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

#### GET /signals/{signal_id}
Get specific signal by ID.

**Response:**
```json
{
  "id": 1,
  "timestamp": "2024-01-01T12:00:00Z",
  "exchange": "binance",
  "symbol": "BTC/USDT",
  "signal_type": "BUY",
  "confidence": 0.87,
  "price": 45000.0,
  "volume": 1.5,
  "metadata": "{\"source\": \"ai_model_v1\"}"
}
```

### Strategies

#### GET /strategies/
Get list of trading strategies.

**Query Parameters:**
- `skip` (int): Number of records to skip
- `limit` (int): Maximum number of records
- `user_id` (int): Filter by user ID

**Response:**
```json
{
  "strategies": [
    {
      "id": 1,
      "name": "BTC Arbitrage",
      "user_id": 1,
      "market": "BTC/USDT",
      "state": "active",
      "pnl": 1250.75,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /strategies/
Create a new trading strategy.

**Request Body:**
```json
{
  "name": "BTC Arbitrage",
  "market": "BTC/USDT",
  "config": "{\"max_position\": 1.0, \"stop_loss\": 0.02}"
}
```

**Response:**
```json
{
  "message": "Strategy created successfully",
  "strategy_id": 1
}
```

### Reports

#### GET /reports/dashboard
Get dashboard statistics.

**Query Parameters:**
- `user_id` (int): Filter by user ID (optional)

**Response:**
```json
{
  "total_strategies": 12,
  "active_strategies": 8,
  "total_pnl": 2847.50,
  "recent_signals_24h": 847,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

#### GET /reports/performance
Get performance report.

**Query Parameters:**
- `user_id` (int): Filter by user ID
- `days` (int): Number of days to include (default: 30)

**Response:**
```json
{
  "period_days": 30,
  "strategies": [
    {
      "strategy_id": 1,
      "name": "BTC Arbitrage",
      "market": "BTC/USDT",
      "pnl": 1250.75,
      "state": "active",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total_pnl": 2847.50,
  "generated_at": "2024-01-01T12:00:00Z"
}
```

#### GET /reports/signals/analytics
Get signal analytics.

**Query Parameters:**
- `exchange` (string): Filter by exchange
- `symbol` (string): Filter by symbol
- `hours` (int): Time period in hours (default: 24)

**Response:**
```json
{
  "period_hours": 24,
  "total_signals": 847,
  "signal_types": {
    "BUY": 423,
    "SELL": 424
  },
  "average_confidence": 0.82,
  "exchange": "binance",
  "symbol": "BTC/USDT",
  "generated_at": "2024-01-01T12:00:00Z"
}
```

### Configuration

#### GET /config/white-label
Get white-label configuration.

**Response:**
```json
{
  "brand_name": "CerebellumBot",
  "primary_color": "#00FFD1",
  "secondary_color": "#0A0A0A",
  "accent_color": "#F2F2F2"
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "detail": "Invalid request parameters"
}
```

### 401 Unauthorized
```json
{
  "detail": "Not authenticated"
}
```

### 403 Forbidden
```json
{
  "detail": "Not enough permissions"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 422 Validation Error
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

## Rate Limiting

API endpoints are rate limited:
- General API: 10 requests per second
- Authentication: 5 requests per minute
- WebSocket connections: 100 concurrent connections per IP

## WebSocket API

### /ws/signals
Real-time signal stream.

**Connection:**
```javascript
const ws = new WebSocket('wss://api.cerebellumbot.ai/ws/signals');
```

**Message Format:**
```json
{
  "type": "signal",
  "data": {
    "id": 1,
    "timestamp": "2024-01-01T12:00:00Z",
    "exchange": "binance",
    "symbol": "BTC/USDT",
    "signal_type": "BUY",
    "confidence": 0.87,
    "price": 45000.0,
    "volume": 1.5
  }
}
```
