import type { CryptoPrice } from "../../client/src/lib/types";

const COINGECKO_API = "https://api.coingecko.com/api/v3";
const TRACKED_COINS = ["bitcoin", "ethereum", "solana", "cardano", "polkadot"];

export async function getCryptoPrices(): Promise<CryptoPrice[]> {
  try {
    const params = new URLSearchParams({
      ids: TRACKED_COINS.join(","),
      vs_currency: "usd",
      include_24h_change: "true",
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
      price_change_percentage_24h: coin.price_change_percentage_24h || 0
    }));
  } catch (error) {
    console.error("Error fetching crypto prices:", error);
    return [];
  }
}