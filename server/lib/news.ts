import type { NewsArticle } from "../../client/src/lib/types";

const CRYPTO_COMPARE_API = "https://min-api.cryptocompare.com/data/v2";

if (!process.env.CRYPTOCOMPARE_API_KEY) {
  throw new Error("CRYPTOCOMPARE_API_KEY is required");
}

export async function getLatestNews(): Promise<NewsArticle[]> {
  try {
    const response = await fetch(
      `${CRYPTO_COMPARE_API}/news/?lang=EN&sortOrder=latest&api_key=${process.env.CRYPTOCOMPARE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch news");
    }

    const data = await response.json();

    if (!data.Data || !Array.isArray(data.Data)) {
      throw new Error("Invalid response format from CryptoCompare API");
    }

    return data.Data.slice(0, 5).map((article: any) => ({
      title: article.title,
      url: article.url,
      source: article.source,
      published_at: new Date(article.published_on * 1000).toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
}