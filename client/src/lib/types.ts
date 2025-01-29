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
}

export interface NewsArticle {
  title: string;
  url: string;
  source: string;
  published_at: string;
}

export interface ChatResponse {
  message: string;
  cryptoData?: CryptoPrice[];
  newsData?: NewsArticle[];
}
