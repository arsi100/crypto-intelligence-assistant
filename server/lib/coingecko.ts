import type { CryptoPrice } from "../../client/src/lib/types";

const COINGECKO_API = "https://api.coingecko.com/api/v3";
const TRACKED_COINS = ["bitcoin", "ethereum", "solana", "cardano", "polkadot"];

export async function getCryptoPrices(): Promise<CryptoPrice[]> {
  try {
    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=${TRACKED_COINS.join(",")}&vs_currency=usd&include_24hr_change=true`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch crypto prices");
    }

    const data = await response.json();
    
    return TRACKED_COINS.map(id => ({
      id,
      symbol: id.substring(0, 3).toUpperCase(),
      name: id.charAt(0).toUpperCase() + id.slice(1),
      current_price: data[id].usd,
      price_change_percentage_24h: data[id].usd_24h_change
    }));
  } catch (error) {
    console.error("Error fetching crypto prices:", error);
    return [];
  }
}
