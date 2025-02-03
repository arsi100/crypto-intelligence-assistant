import type { CryptoPrice, MarketData } from "../../client/src/lib/types";

const COINGECKO_API = "https://api.coingecko.com/api/v3";
const TRACKED_COINS = ["bitcoin", "ethereum", "solana", "cardano", "polkadot"];

export async function getCryptoPrices(): Promise<CryptoPrice[]> {
  try {
    const params = new URLSearchParams({
      ids: TRACKED_COINS.join(","),
      vs_currency: "usd",
      include_24h_change: "true",
      sparkline: "false",
      include_market_cap: "true",
      include_ath: "true",
      include_atl: "true",
      include_volume: "true",
      include_supply: "true",
    });

    const response = await fetch(
      `${COINGECKO_API}/coins/markets?${params.toString()}`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch crypto prices: ${response.status}`);
    }

    const data = await response.json();
    return data.map((coin: any) => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      current_price: coin.current_price,
      price_change_percentage_24h: coin.price_change_percentage_24h || 0,
      market_cap: coin.market_cap || 0,
      total_volume: coin.total_volume || 0,
      circulating_supply: coin.circulating_supply || 0,
      ath: coin.ath || 0,
      ath_change_percentage: coin.ath_change_percentage || 0,
      atl: coin.atl || 0,
      atl_change_percentage: coin.atl_change_percentage || 0,
      last_updated: coin.last_updated || new Date().toISOString()
    }));
  } catch (error) {
    console.error("Error fetching crypto prices:", error);
    return [];
  }
}

export async function getGlobalMarketData(): Promise<MarketData> {
  try {
    const response = await fetch(`${COINGECKO_API}/global`, {
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch global market data: ${response.status}`);
    }

    const data = await response.json();
    const marketData = data.data;

    return {
      total_market_cap_usd: marketData.total_market_cap.usd || 0,
      total_volume_usd: marketData.total_volume.usd || 0,
      bitcoin_dominance: marketData.market_cap_percentage.btc || 0,
      market_cap_change_percentage_24h: marketData.market_cap_change_percentage_24h_usd || 0
    };
  } catch (error) {
    console.error("Error fetching global market data:", error);
    return {
      total_market_cap_usd: 0,
      total_volume_usd: 0,
      bitcoin_dominance: 0,
      market_cap_change_percentage_24h: 0
    };
  }
}