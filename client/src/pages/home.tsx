import ChatWindow from "@/components/chat/chat-window";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Crypto Intelligence Assistant
        </h1>
        <Card className="p-4">
          <ChatWindow />
        </Card>
      </div>
    </div>
  );
}
