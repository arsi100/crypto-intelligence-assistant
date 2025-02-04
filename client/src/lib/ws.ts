let socket: WebSocket | null = null;
const listeners = new Set<(data: any) => void>();

export function connectWebSocket() {
  if (socket?.readyState === WebSocket.OPEN) return;

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${protocol}//${window.location.host}/ws`;
  
  socket = new WebSocket(wsUrl);

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    listeners.forEach(listener => listener(data));
  };

  socket.onclose = () => {
    setTimeout(connectWebSocket, 5000);
  };
}

export function subscribeToUpdates(callback: (data: any) => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function sendMessage(message: object) {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  }
}
