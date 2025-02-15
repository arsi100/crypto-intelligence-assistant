import type { NewsArticle } from "../../client/src/lib/types";
import { db } from "@db";
import { reddit_posts } from "@db/schema";
import { eq } from "drizzle-orm";

const CRYPTO_COMPARE_API = "https://min-api.cryptocompare.com/data/v2";
const REDDIT_API = "https://www.reddit.com/r/cryptocurrency/hot.json";

export async function getLatestNews(): Promise<NewsArticle[]> {
  if (!process.env.CRYPTOCOMPARE_API_KEY) {
    throw new Error("CRYPTOCOMPARE_API_KEY is required");
  }

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

export async function getRedditPosts(): Promise<any[]> {
  try {
    const response = await fetch(REDDIT_API);
    
    if (!response.ok) {
      throw new Error("Failed to fetch Reddit posts");
    }

    const data = await response.json();
    const posts = data.data.children.slice(0, 10); // Get top 10 posts

    // Store Reddit posts
    await Promise.all(posts.map(async (post: any) => {
      const postData = post.data;
      await db.insert(reddit_posts).values({
        post_id: postData.id,
        title: postData.title,
        content: postData.selftext,
        url: `https://reddit.com${postData.permalink}`,
        score: postData.score.toString(),
        num_comments: postData.num_comments.toString(),
        sentiment_score: "0", // Store as string since our schema expects string for numeric
        created_at: new Date(postData.created_utc * 1000),
        updated_at: new Date()
      });
    }));

    return posts;
  } catch (error) {
    console.error("Error fetching Reddit posts:", error);
    return [];
  }
}

// Function to analyze sentiment of Reddit posts
export async function analyzeSentiment(text: string): Promise<string> {
  // This is a placeholder for sentiment analysis
  // You can implement this using your OpenAI integration or another service
  return "0";
}

// Function to update sentiment scores for Reddit posts
export async function updateRedditSentiments(): Promise<void> {
  try {
    const posts = await db.query.reddit_posts.findMany({
      where: (posts, { eq }) => eq(posts.sentiment_score, "0")
    });

    for (const post of posts) {
      const sentiment = await analyzeSentiment(post.title + " " + (post.content || ""));
      await db.update(reddit_posts)
        .set({ sentiment_score: sentiment, updated_at: new Date() })
        .where(eq(reddit_posts.id, post.id));
    }
  } catch (error) {
    console.error("Error updating Reddit sentiments:", error);
  }
}