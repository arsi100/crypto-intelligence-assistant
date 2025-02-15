import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpIcon, ArrowDownIcon, TrendingUp, Activity, BarChart2, Clock } from "lucide-react";
import { getMarketData } from "@/lib/api";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CryptoPrice } from "@/lib/types";

export function Sidebar() {
  const { data: marketData } = useQuery<CryptoPrice[]>({
    queryKey: ["/api/market/top"],
    staleTime: 30000, // Refresh every 30 seconds
  });

  return (
    <div className="w-80 border-r bg-sidebar p-4 h-screen overflow-y-auto">
      <Tabs defaultValue="market" className="w-full">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="market" className="flex-1">Market</TabsTrigger>
          <TabsTrigger value="trending" className="flex-1">Trending</TabsTrigger>
        </TabsList>

        <TabsContent value="market">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Market Overview</h2>
              <Button variant="ghost" size="sm" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                24h
              </Button>
            </div>

            <div className="grid gap-3">
              {marketData?.map((coin) => (
                <Card key={coin.id} className="p-4 hover:bg-accent/5 transition-colors">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{coin.name}</h3>
                        <div className="flex items-center gap-2">
                          <p className="text-xl font-bold">${coin.current_price.toLocaleString()}</p>
                          <div className={`flex items-center text-sm ${
                            coin.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {coin.price_change_percentage_24h >= 0 ? (
                              <ArrowUpIcon className="w-3 h-3" />
                            ) : (
                              <ArrowDownIcon className="w-3 h-3" />
                            )}
                            <span className="ml-1">
                              {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end text-xs text-muted-foreground">
                        <span>Vol: ${(coin.total_volume / 1e6).toFixed(1)}M</span>
                        <span>MCap: ${(coin.market_cap / 1e9).toFixed(1)}B</span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline" className="flex-1 text-xs">
                        <Activity className="w-3 h-3 mr-1" />
                        Analysis
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 text-xs">
                        <BarChart2 className="w-3 h-3 mr-1" />
                        Trade
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="trending">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Trending Assets</h2>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </div>

            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Trending data coming soon...</p>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}