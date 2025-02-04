import type { CryptoPrice, MarketData } from "../../client/src/lib/types";

const CRYPTOCOMPARE_API = "https://min-api.cryptocompare.com/data/pricemultifull";

if (!process.env.CRYPTOCOMPARE_API_KEY) {
  throw new Error("CRYPTOCOMPARE_API_KEY is required");
}

// Map raw API response to our CryptoPrice type
function mapToCryptoPrice(symbol: string, data: any): CryptoPrice {
  try {
    const price = {
      id: symbol.toLowerCase(),
      symbol: symbol,
      name: symbol,
      current_price: data.PRICE || 0,
      price_change_percentage_24h: data.CHANGEPCT24HOUR || 0,
      market_cap: data.MKTCAP || 0,
      total_volume: data.TOTALVOLUME24H || 0,
      circulating_supply: data.SUPPLY || 0,
      last_updated: new Date().toISOString()
    };
    console.log(`Processed price data for ${symbol}:`, price);
    return price;
  } catch (error) {
    console.error(`Error mapping price data for ${symbol}:`, error);
    throw error;
  }
}

export async function getMarketPrices(symbols: string[] = ["BTC", "ETH", "SOL", "LINK", "MATIC", "SHIB", "LTC", "XRP"]): Promise<CryptoPrice[]> {
  try {
    console.log("Fetching market prices for symbols:", symbols);
    const url = new URL(CRYPTOCOMPARE_API);
    url.searchParams.append("fsyms", symbols.join(","));
    url.searchParams.append("tsyms", "USD");
    url.searchParams.append("api_key", process.env.CRYPTOCOMPARE_API_KEY || "");

    console.log("Requesting URL:", url.toString());

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Apikey ${process.env.CRYPTOCOMPARE_API_KEY}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("CryptoCompare API error:", errorText);
      throw new Error(`Failed to fetch market prices: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Raw API response:", JSON.stringify(data, null, 2));

    if (!data.RAW) {
      console.error("Invalid API response format:", data);
      throw new Error("Invalid API response format - missing RAW data");
    }

    const prices = Object.entries(data.RAW).map(([symbol, coinData]: [string, any]) => 
      mapToCryptoPrice(symbol, coinData.USD)
    );

    console.log("Processed prices:", prices);
    return prices;
  } catch (error) {
    console.error("Error fetching market prices:", error);
    throw error;
  }
}

// Get historical data for analysis
export async function getHistoricalData(symbol: string, limit: number = 7): Promise<any> {
  try {
    console.log(`Fetching historical data for ${symbol}, limit: ${limit} days`);
    const response = await fetch(
      `${CRYPTOCOMPARE_API}/histoday?fsym=${symbol}&tsym=USD&limit=${limit}&api_key=${process.env.CRYPTOCOMPARE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch historical data");
    }

    const data = await response.json();
    console.log(`Historical data for ${symbol}:`, data);
    return data.Data;
  } catch (error) {
    console.error("Error fetching historical data:", error);
    throw error;
  }
}

export async function getTechnicalIndicators(symbol: string): Promise<any> {
  try {
    console.log(`Fetching technical indicators for ${symbol}`);
    const response = await fetch(
      `${CRYPTOCOMPARE_API}/technical/indicators/trading?fsym=${symbol}&tsym=USD&aggregate=1&limit=1&api_key=${process.env.CRYPTOCOMPARE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch technical indicators");
    }

    const data = await response.json();
    console.log(`Technical indicators for ${symbol}:`, data);
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
    console.log("Market overview data:", data);

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