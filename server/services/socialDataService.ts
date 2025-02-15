import snoowrap from "snoowrap";
import type { NewsArticle } from "../../client/src/lib/types";
import { analyzeSentiment } from "./openai";
import { db } from "@db";
import { reddit_posts } from "@db/schema";
import { eq } from "drizzle-orm";

if (!process.env.REDDIT_CLIENT_ID || !process.env.REDDIT_CLIENT_SECRET) {
  throw new Error("Reddit API credentials are required");
}

const reddit = new snoowrap({
  userAgent: 'crypto-intelligence-assistant',
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  refreshToken: process.env.REDDIT_REFRESH_TOKEN
});

export interface RedditPost {
  id: string;
  title: string;
  content: string;
  url: string;
  score: number;
  num_comments: number;
  created_utc: number;
  sentiment_score: number;
  source: "reddit";
}

export async function fetchCryptoRedditPosts(): Promise<RedditPost[]> {
  try {
    const subreddit = await reddit.getSubreddit('CryptoCurrency');
    const topPosts = await subreddit.getHot({ limit: 25 });

    const posts = await Promise.all(topPosts.map(async (post: snoowrap.Submission) => {
      // Analyze sentiment using OpenAI
      const sentiment = await analyzeSentiment(post.title + "\n" + post.selftext);

      return {
        id: post.id,
        title: post.title,
        content: post.selftext || "",  // Ensure content is never null
        url: post.url,
        score: post.score,
        num_comments: post.num_comments,
        created_utc: post.created_utc,
        sentiment_score: sentiment.rating,
        source: "reddit" as const
      };
    }));

    // Store posts in database
    await storePosts(posts);

    return posts;
  } catch (error) {
    console.error("Error fetching Reddit posts:", error);
    throw error;
  }
}

async function storePosts(posts: RedditPost[]) {
  try {
    // Store each post, updating if it already exists
    for (const post of posts) {
      await db.insert(reddit_posts).values({
        post_id: post.id,
        title: post.title,
        content: post.content,
        url: post.url,
        score: post.score.toString(),  // Convert to string as per schema
        num_comments: post.num_comments,
        created_at: new Date(post.created_utc * 1000),
        sentiment_score: post.sentiment_score.toString()  // Convert to string as per schema
      }).onConflictDoUpdate({
        target: reddit_posts.post_id,
        set: {
          score: post.score.toString(),
          num_comments: post.num_comments,
          sentiment_score: post.sentiment_score.toString()
        }
      });
    }
  } catch (error) {
    console.error("Error storing Reddit posts:", error);
    throw error;
  }
}

// Get recent posts with sentiment analysis
export async function getRecentSentiment(): Promise<{
  overall_sentiment: number;
  top_posts: RedditPost[];
}> {
  try {
    const recentPosts = await db.query.reddit_posts.findMany({
      orderBy: (posts, { desc }) => [desc(posts.created_at)],
      limit: 10
    });

    // Convert string scores back to numbers for calculation
    const sentiments = recentPosts.map(post => parseFloat(post.sentiment_score));
    const overall_sentiment = sentiments.reduce((acc, score) => acc + score, 0) / sentiments.length;

    return {
      overall_sentiment,
      top_posts: recentPosts.map(post => ({
        id: post.post_id,
        title: post.title,
        content: post.content || "",  // Ensure content is never null
        url: post.url,
        score: parseInt(post.score),
        num_comments: post.num_comments,
        created_utc: post.created_at.getTime() / 1000,
        sentiment_score: parseFloat(post.sentiment_score),
        source: "reddit" as const
      }))
    };
  } catch (error) {
    console.error("Error getting recent sentiment:", error);
    throw error;
  }
}