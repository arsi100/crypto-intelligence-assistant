import type { MarketSentiment } from './types';
import { db } from "@db";
import { technical_indicators } from "@db/schema";

const FEAR_GREED_API = 'https://api.alternative.me/fng/';

export async function getFearGreedIndex(): Promise<{
  value: number;
  classification: string;
  timestamp: string;
}> {
  try {
    const response = await fetch(FEAR_GREED_API);
    if (!response.ok) {
      throw new Error(`Fear & Greed API error: ${response.statusText}`);
    }

    const data = await response.json();
    const latest = data.data[0];

    // Store the fear and greed data
    await db.insert(technical_indicators).values({
      symbol: 'MARKET',
      indicator_type: 'fear_greed',
      value: parseInt(latest.value),
      parameters: {
        classification: latest.value_classification
      },
      timestamp: new Date(parseInt(latest.timestamp) * 1000)
    });

    return {
      value: parseInt(latest.value),
      classification: latest.value_classification,
      timestamp: new Date(parseInt(latest.timestamp) * 1000).toISOString()
    };
  } catch (error) {
    console.error('Error fetching Fear & Greed Index:', error);
    throw error;
  }
}

// Combine with other market metrics
export async function getMarketSentiment(symbol: string): Promise<MarketSentiment> {
  const fearGreed = await getFearGreedIndex();

  // Get recent social sentiment data from our database
  const recentSentiments = await db.query.technical_indicators.findMany({
    where: (indicators, { and, eq }) => and(
      eq(indicators.symbol, symbol),
      eq(indicators.indicator_type, 'social_sentiment')
    ),
    orderBy: (indicators, { desc }) => [desc(indicators.timestamp)],
    limit: 100
  });

  // Calculate aggregated sentiment metrics
  const sentimentSum = recentSentiments.reduce((acc, curr) => acc + Number(curr.value), 0);
  const averageSentiment = recentSentiments.length > 0 ? sentimentSum / recentSentiments.length : 0;

  return {
    symbol,
    timestamp: fearGreed.timestamp,
    fear_greed_score: fearGreed.value,
    social_volume: recentSentiments.length,
    average_sentiment: averageSentiment,
    trending_score: calculateTrendingScore(recentSentiments),
    source_breakdown: aggregateSourceBreakdown(recentSentiments)
  };
}

function calculateTrendingScore(sentiments: typeof technical_indicators.$inferSelect[]): number {
  if (sentiments.length === 0) return 0;

  // Weight recent sentiments more heavily
  return sentiments.reduce((acc, curr, idx) => {
    const weight = 1 / (idx + 1); // More recent items get higher weight
    return acc + (Number(curr.value) * weight);
  }, 0) / sentiments.reduce((acc, _, idx) => acc + (1 / (idx + 1)), 0);
}

function aggregateSourceBreakdown(sentiments: typeof technical_indicators.$inferSelect[]): {
  [key: string]: { count: number; sentiment: number; }
} {
  const breakdown: { [key: string]: { count: number; total: number; }} = {};

  sentiments.forEach(sentiment => {
    const source = sentiment.parameters?.source || 'unknown';
    if (!breakdown[source]) {
      breakdown[source] = { count: 0, total: 0 };
    }
    breakdown[source].count++;
    breakdown[source].total += Number(sentiment.value);
  });

  return Object.entries(breakdown).reduce((acc, [source, data]) => ({
    ...acc,
    [source]: {
      count: data.count,
      sentiment: data.total / data.count
    }
  }), {});
}