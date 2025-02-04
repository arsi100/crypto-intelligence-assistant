import { Sidebar } from "@/components/layout/sidebar";
import { ChatWindow } from "@/components/chat/chat-window";
import { PriceChart } from "@/components/market/price-chart";

export default function Home() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-[300px]">
          <PriceChart coinId="bitcoin" />
        </div>
        <div className="flex-1">
          <ChatWindow />
        </div>
      </div>
    </div>
  );
}
