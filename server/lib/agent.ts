import type { AgentTask } from "../../client/src/lib/types";
import { db } from "@db";
import { agentTasks } from "@db/schema";
import { eq } from "drizzle-orm";
import { getMarketPrices } from "./market";

export async function createAgentTask(
  type: AgentTask["type"],
  parameters: AgentTask["parameters"],
  chatId: number
): Promise<AgentTask> {
  const [task] = await db.insert(agentTasks).values({
    type,
    parameters,
    status: "pending",
    chat_id: chatId
  }).returning();

  return {
    ...task,
    type: task.type as AgentTask["type"],
    parameters: task.parameters as AgentTask["parameters"],
    status: task.status as AgentTask["status"]
  };
}

export async function processAgentTasks() {
  try {
    // Get all pending tasks
    const pendingTasks = await db.query.agentTasks.findMany({
      where: eq(agentTasks.status, "pending")
    });

    for (const task of pendingTasks) {
      try {
        switch (task.type) {
          case "price_alert": {
            const { coin_symbol, price_target } = task.parameters;
            if (!coin_symbol || !price_target) continue;

            const prices = await getMarketPrices([coin_symbol]);
            const currentPrice = prices[0]?.current_price;

            if (currentPrice && Math.abs(currentPrice - price_target) < price_target * 0.01) {
              // Price is within 1% of target
              await db.update(agentTasks)
                .set({ 
                  status: "completed",
                  completed_at: new Date()
                })
                .where(eq(agentTasks.id, task.id));

              // TODO: Implement notification system
              console.log(`Price alert triggered for ${coin_symbol} at ${currentPrice}`);
            }
            break;
          }

          case "email_notification": {
            const { email, message } = task.parameters;
            if (!email || !message) continue;

            // TODO: Implement email sending
            console.log(`Would send email to ${email}: ${message}`);

            await db.update(agentTasks)
              .set({ 
                status: "completed",
                completed_at: new Date()
              })
              .where(eq(agentTasks.id, task.id));
            break;
          }

          case "trading_signal": {
            // TODO: Implement trading signal monitoring
            break;
          }
        }
      } catch (error) {
        console.error(`Error processing task ${task.id}:`, error);
        await db.update(agentTasks)
          .set({ status: "failed" })
          .where(eq(agentTasks.id, task.id));
      }
    }
  } catch (error) {
    console.error("Error processing agent tasks:", error);
  }
}

// Start task processing loop
const TASK_INTERVAL = 30000; // 30 seconds
let taskInterval: NodeJS.Timeout;

export function startAgentTaskProcessor() {
  if (taskInterval) {
    clearInterval(taskInterval);
  }
  
  taskInterval = setInterval(processAgentTasks, TASK_INTERVAL);
  console.log("Agent task processor started");
}
