export interface Message {
  id: number;
  content: string;
  role: "user" | "assistant";
  timestamp: string;
  metadata?: {
    cryptoData?: CryptoPrice[];
    newsData?: NewsArticle[];
  };
}

export interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  circulating_supply: number;
  last_updated: string;
  // Technical indicators
  rsi_24h?: number;
  support_level?: number;
  resistance_level?: number;
  trade_signal?: 'buy' | 'sell' | 'hold';
  confidence_score?: number;
}

export interface NewsArticle {
  title: string;
  url: string;
  source: string;
  published_at: string;
}

export interface MarketData {
  total_market_cap_usd: number;
  total_volume_usd: number;
  bitcoin_dominance: number;
  market_cap_change_percentage_24h: number;
}

export interface TradingSignal {
  coin_symbol: string;
  action: 'buy' | 'sell' | 'hold';
  target_price: number;
  stop_loss: number;
  take_profit: number;
  confidence_score: number;
  reasoning: string;
  timestamp: string;
}

export interface DailyAnalysis {
  date: string;
  signals: TradingSignal[];
  market_summary: string;
  risk_level: 'low' | 'medium' | 'high';
}

export interface ChatResponse {
  message: string;
  cryptoData?: CryptoPrice[];
  newsData?: NewsArticle[];
  marketData?: MarketData;
  tradingSignals?: TradingSignal[];
  dailyAnalysis?: DailyAnalysis;
}

export interface AgentTask {
  type: 'price_alert' | 'email_notification' | 'trading_signal';
  parameters: {
    coin_symbol?: string;
    price_target?: number;
    email?: string;
    message?: string;
    notification_type?: 'email' | 'app';
  };
  status: 'pending' | 'active' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
}