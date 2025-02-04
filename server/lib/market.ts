import type { CryptoPrice, MarketData } from "../../client/src/lib/types";

const CRYPTOCOMPARE_API = "https://min-api.cryptocompare.com/data/v2";

if (!process.env.CRYPTOCOMPARE_API_KEY) {
  throw new Error("CRYPTOCOMPARE_API_KEY is required");
}

// Map raw API response to our CryptoPrice type
function mapToCryptoPrice(symbol: string, data: any): CryptoPrice {
  return {
    id: symbol.toLowerCase(),
    symbol: symbol,
    name: symbol, // We'll get full names from a separate API call if needed
    current_price: data.USD.PRICE,
    price_change_percentage_24h: data.USD.CHANGEPCT24HOUR,
    market_cap: data.USD.MKTCAP,
    total_volume: data.USD.TOTALVOLUME24H,
    circulating_supply: data.USD.SUPPLY,
    last_updated: new Date(data.USD.LASTUPDATE * 1000).toISOString()
  };
}

export async function getMarketPrices(symbols: string[] = ["BTC", "ETH", "SOL", "LINK", "MATIC"]): Promise<CryptoPrice[]> {
  try {
    const response = await fetch(
      `${CRYPTOCOMPARE_API}/pricemultifull?fsyms=${symbols.join(",")}&tsyms=USD&api_key=${process.env.CRYPTOCOMPARE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch market prices");
    }

    const data = await response.json();
    const RAW = data.RAW || {};

    return Object.entries(RAW).map(([symbol, data]: [string, any]) => 
      mapToCryptoPrice(symbol, data)
    );
  } catch (error) {
    console.error("Error fetching market prices:", error);
    throw error;
  }
}

export async function getTechnicalIndicators(symbol: string): Promise<any> {
  try {
    const response = await fetch(
      `${CRYPTOCOMPARE_API}/technical/indicators/trading?fsym=${symbol}&tsym=USD&aggregate=1&limit=1&api_key=${process.env.CRYPTOCOMPARE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch technical indicators");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching technical indicators:", error);
    throw error;
  }
}

// Get market overview data
export async function getMarketOverview(): Promise<MarketData> {
  try {
    const response = await fetch(
      `${CRYPTOCOMPARE_API}/blockchain/latest?api_key=${process.env.CRYPTOCOMPARE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch market overview");
    }

    const data = await response.json();

    return {
      total_market_cap_usd: data.Data.total_mcap || 0,
      total_volume_usd: data.Data.total_volume_24h || 0,
      bitcoin_dominance: data.Data.btc_dominance || 0,
      market_cap_change_percentage_24h: data.Data.mcap_change_24h || 0
    };
  } catch (error) {
    console.error("Error fetching market overview:", error);
    throw new Error("Failed to fetch market overview");
  }
}