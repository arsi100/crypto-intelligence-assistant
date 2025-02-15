import type { SocialMetric, AgentTask } from '../aggregators/types';
import OpenAI from 'openai';
import { db } from '@db';
import { technical_indicators } from '@db/schema';

const openai = new OpenAI();

export abstract class BaseAgent {
  protected task: AgentTask;
  protected running: boolean = false;

  constructor(task: AgentTask) {
    this.task = task;
  }

  abstract collect(): Promise<SocialMetric[]>;

  protected async analyzeSentiment(text: string): Promise<number> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Analyze the sentiment of the following crypto-related text. 
                     Return a single number between -1 (extremely negative) and 1 (extremely positive).
                     Consider market impact, technical analysis, and overall sentiment.`
          },
          {
            role: "user",
            content: text
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content);
      return result.sentiment;
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      return 0;
    }
  }

  protected async storeSentiment(metrics: SocialMetric[]): Promise<void> {
    try {
      for (const metric of metrics) {
        await db.insert(technical_indicators).values({
          symbol: 'GENERAL',
          indicator_type: 'social_sentiment',
          value: metric.sentiment_score,
          parameters: {
            source: metric.source,
            volume: metric.volume,
            engagement: metric.engagement
          },
          timestamp: new Date(metric.timestamp)
        });
      }
    } catch (error) {
      console.error('Error storing sentiment data:', error);
      throw error;
    }
  }

  async start(): Promise<void> {
    if (this.running) return;
    this.running = true;

    while (this.running) {
      try {
        const metrics = await this.collect();
        await this.storeSentiment(metrics);
        await new Promise(resolve => setTimeout(resolve, this.task.interval));
      } catch (error) {
        console.error(`Agent error (${this.task.type}):`, error);
        this.running = false;
        throw error;
      }
    }
  }

  stop(): void {
    this.running = false;
  }
}
