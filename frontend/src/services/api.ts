const API_BASE_URL = 'https://cerebellumbot.onrender.com/api';

export interface DemoRequest {
  name: string;
  email: string;
  telegram?: string;
}

export interface InvestorRequest {
  name: string;
  email: string;
  expected_investment: string;
}

export interface Signal {
  id: number;
  timestamp: string;
  exchange: string;
  symbol: string;
  signal_type: string;
  confidence: number;
  price: number;
  volume: number;
  metadata?: string;
}

export interface ApiResponse<T = any> {
  message?: string;
  id?: number;
  detail?: string;
  signals?: T[];
}

export const api = {
  async submitDemoRequest(data: DemoRequest): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/requests/demo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to submit demo request');
    }

    return response.json();
  },

  async submitInvestorRequest(data: InvestorRequest): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/requests/investor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to submit investor request');
    }

    return response.json();
  },

  async getSignals(): Promise<Signal[]> {
    const response = await fetch(`${API_BASE_URL}/signals/`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch signals');
    }

    const data = await response.json();
    return data.signals || [];
  },

  async getWhiteLabelConfig(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/config/white-label`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch white-label config');
    }

    return response.json();
  },

  async getMarketData(exchange: string, symbol: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/trade/market-data/${exchange}/${symbol}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch market data');
    }

    return response.json();
  },

  async placeOrder(orderData: {
    exchange: string;
    symbol: string;
    side: string;
    amount: number;
    price?: number;
  }): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/trade/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error('Failed to place order');
    }

    return response.json();
  },

  async getOrderStatus(orderId: string, exchange: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/trade/order/${orderId}?exchange=${exchange}`);
    
    if (!response.ok) {
      throw new Error('Failed to get order status');
    }

    return response.json();
  },

  async cancelOrder(orderId: string, exchange: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/trade/order/${orderId}?exchange=${exchange}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to cancel order');
    }

    return response.json();
  },

  async getPortfolioBalance(exchange: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/trade/portfolio/${exchange}`);
    
    if (!response.ok) {
      throw new Error('Failed to get portfolio balance');
    }

    return response.json();
  }
};
