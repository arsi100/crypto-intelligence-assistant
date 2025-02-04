import { Sidebar } from "@/components/layout/sidebar";
import { ChatWindow } from "@/components/chat/chat-window";
import { PriceChart } from "@/components/market/price-chart";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Main Content */}
        <div className="flex-1 flex flex-col max-w-6xl mx-auto p-8">
          <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Crypto Intelligence Assistant
          </h1>
          <div className="flex gap-6">
            <div className="flex-1 flex flex-col">
              <div className="h-[300px] mb-6">
                <PriceChart coinId="bitcoin" />
              </div>
              <div className="flex-1 bg-card rounded-lg shadow-sm">
                <ChatWindow />
              </div>
            </div>
            {/* Sidebar */}
            <div className="w-80">
              <Sidebar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}