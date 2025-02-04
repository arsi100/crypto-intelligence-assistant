import { ChatWindow } from "@/components/chat/chat-window";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Crypto Intelligence Assistant
        </h1>
        <div className="bg-card rounded-lg shadow-sm h-[600px]">
          <ChatWindow />
        </div>
      </div>
    </div>
  );
}