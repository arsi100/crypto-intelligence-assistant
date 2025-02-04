import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getCoinData } from "@/lib/api";

interface PriceChartProps {
  coinId: string;
}

export function PriceChart({ coinId }: PriceChartProps) {
  const { data: chartData } = useQuery({
    queryKey: [`/api/market/coin/${coinId}`],
  });

  const formatData = (data: [number, number][]) => {
    return data.map(([timestamp, price]) => ({
      timestamp: new Date(timestamp).toLocaleDateString(),
      price
    }));
  };

  return (
    <Card className="p-4 h-[300px]">
      {chartData && (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formatData(chartData.prices)}>
            <XAxis dataKey="timestamp" />
            <YAxis domain={['auto', 'auto']} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="price"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
