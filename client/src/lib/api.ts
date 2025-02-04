import { apiRequest } from "./queryClient";

export async function sendChatMessage(content: string) {
  const res = await apiRequest("POST", "/api/chat", { content });
  return res.json();
}

export async function getChatHistory() {
  const res = await apiRequest("GET", "/api/chat/history");
  return res.json();
}

export async function getMarketData() {
  const res = await apiRequest("GET", "/api/market/top");
  return res.json();
}

export async function getCoinData(coinId: string) {
  const res = await apiRequest("GET", `/api/market/coin/${coinId}`);
  return res.json();
}
