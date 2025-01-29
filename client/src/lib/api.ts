import type { Message, ChatResponse } from "./types";

const API_BASE = "/api";

export async function sendMessage(content: string): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: content }),
  });

  if (!response.ok) {
    throw new Error("Failed to send message");
  }

  return response.json();
}

export async function getMessageHistory(): Promise<Message[]> {
  const response = await fetch(`${API_BASE}/messages`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch message history");
  }

  return response.json();
}
