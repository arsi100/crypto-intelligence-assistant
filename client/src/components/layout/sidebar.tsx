import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { getMarketData } from "@/lib/api";

export function Sidebar() {
  const { data: marketData } = useQuery({
    queryKey: ["/api/market/top"],
  });

  return (
    <div className="w-64 border-r bg-sidebar p-4 h-screen overflow-y-auto"> {/* Added width and border back */}
      <h2 className="text-xl font-semibold mb-4">Market Overview</h2> {/* Changed font weight */}

      <div className="space-y-3"> {/* Added a container for better spacing */}
        {marketData?.map((coin: any) => (
          <Card key={coin.id} className="p-3 hover:bg-accent/5 transition-colors">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">{coin.name}</h3>
                <p className="text-sm text-muted-foreground">${coin.current_price.toLocaleString()}</p>
              </div>
              <div className={`flex items-center ${
                coin.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {coin.price_change_percentage_24h >= 0 ? (
                  <ArrowUpIcon className="w-4 h-4" />
                ) : (
                  <ArrowDownIcon className="w-4 h-4" />
                )}
                <span className="ml-1">
                  {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}