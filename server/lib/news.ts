import type { NewsArticle } from "../../client/src/lib/types";

const CRYPTO_COMPARE_API = "https://min-api.cryptocompare.com/data/v2";

export async function getLatestNews(): Promise<NewsArticle[]> {
  try {
    const response = await fetch(
      `${CRYPTO_COMPARE_API}/news/?lang=EN&sortOrder=latest`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch news");
    }

    const data = await response.json();

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