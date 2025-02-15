import type { AgentTask, SentimentSource } from '../aggregators/types';
import { TelegramAgent } from './telegramAgent';
import { BaseAgent } from './baseAgent';
import { getFearGreedIndex } from '../aggregators/fearGreed';

export class AgentManager {
  private agents: Map<string, BaseAgent> = new Map();
  private sources: SentimentSource[] = [];

  constructor() {
    // Initialize with default sources
    this.sources = [
      {
        name: 'fear_and_greed',
        type: 'api',
        enabled: true,
        config: {
          base_url: 'https://api.alternative.me/fng/'
        }
      }
    ];
  }

  async initialize(): Promise<void> {
    // Start with Fear & Greed Index integration
    try {
      const fearGreed = await getFearGreedIndex();
      console.log('Fear & Greed Index initialized:', fearGreed);
    } catch (error) {
      console.error('Failed to initialize Fear & Greed Index:', error);
    }
  }

  addAgent(task: AgentTask): void {
    let agent: BaseAgent;

    switch (task.type) {
      case 'telegram':
        agent = new TelegramAgent(task);
        break;
      // Add other agent types here
      default:
        throw new Error(`Unknown agent type: ${task.type}`);
    }

    this.agents.set(task.id, agent);
  }

  async startAgent(taskId: string): Promise<void> {
    const agent = this.agents.get(taskId);
    if (!agent) {
      throw new Error(`Agent not found: ${taskId}`);
    }
    await agent.start();
  }

  stopAgent(taskId: string): void {
    const agent = this.agents.get(taskId);
    if (agent) {
      agent.stop();
    }
  }

  addSource(source: SentimentSource): void {
    this.sources.push(source);
  }

  removeSource(name: string): void {
    this.sources = this.sources.filter(s => s.name !== name);
  }

  getSources(): SentimentSource[] {
    return this.sources;
  }
}

// Create singleton instance
export const agentManager = new AgentManager();
