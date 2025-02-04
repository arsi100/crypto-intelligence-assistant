const COINGECKO_API = "https://api.coingecko.com/api/v3";

export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
}

export async function getTopCoins(limit: number = 10): Promise<CoinData[]> {
  try {
    const response = await fetch(
      `${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&sparkline=false`
    );
    if (!response.ok) throw new Error("CoinGecko API error");
    return await response.json();
  } catch (error) {
    console.error("CoinGecko API error:", error);
    throw new Error("Failed to fetch market data");
  }
}

export async function getCoinHistory(
  coinId: string,
  days: number = 7
): Promise<{ prices: [number, number][] }> {
  try {
    const response = await fetch(
      `${COINGECKO_API}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
    );
    if (!response.ok) throw new Error("CoinGecko API error");
    return await response.json();
  } catch (error) {
    console.error("CoinGecko API error:", error);
    throw new Error("Failed to fetch historical data");
  }
}
