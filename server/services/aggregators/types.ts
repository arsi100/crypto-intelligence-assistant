// Common interfaces for data aggregation services
export interface SocialMetric {
  timestamp: string;
  source: string;
  sentiment_score: number;
  volume: number;
  engagement: number;
}

export interface MarketSentiment {
  symbol: string;
  timestamp: string;
  fear_greed_score: number;
  social_volume: number;
  average_sentiment: number;
  trending_score: number;
  source_breakdown: {
    [key: string]: {
      count: number;
      sentiment: number;
    };
  };
}

export interface AgentTask {
  id: string;
  type: 'telegram' | 'discord' | 'github' | 'forum';
  target: string;
  interval: number;
  last_run?: string;
  config: Record<string, any>;
}

export interface SentimentSource {
  name: string;
  type: 'api' | 'agent';
  enabled: boolean;
  config: {
    api_key?: string;
    base_url?: string;
    rate_limit?: number;
    endpoints?: Record<string, string>;
  };
}
