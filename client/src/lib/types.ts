export interface Message {
  id: number;
  content: string;
  isAi: boolean;
  timestamp: string;
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
  ath: number;
  ath_change_percentage: number;
  atl: number;
  atl_change_percentage: number;
  last_updated: string;
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

export interface ChatResponse {
  message: string;
  cryptoData?: CryptoPrice[];
  newsData?: NewsArticle[];
  marketData?: MarketData;
}