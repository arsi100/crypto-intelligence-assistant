import { useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageInput } from "./message-input";
import { sendChatMessage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, TrendingUp, LineChart } from "lucide-react";
import type { Message } from "@/lib/types";

export function ChatWindow() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current messages
  const { data: messages = [], isLoading: isLoadingHistory } = useQuery<Message[]>({
    queryKey: ["/api/chat/history"],
    initialData: [],
  });

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Scroll on messages change and after render
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const mutation = useMutation({
    mutationFn: sendChatMessage,
    onMutate: async (newMessage) => {
      await queryClient.cancelQueries({ queryKey: ["/api/chat/history"] });
      const previousMessages = queryClient.getQueryData(["/api/chat/history"]);

      // Optimistic update
      const optimisticMessage = {
        id: Date.now(),
        content: newMessage,
        role: "user",
        timestamp: new Date().toISOString()
      };

      queryClient.setQueryData(["/api/chat/history"], (old: Message[] = []) => [...old, optimisticMessage]);
      scrollToBottom();
      return { previousMessages };
    },
    onError: (error: Error, _, context) => {
      queryClient.setQueryData(["/api/chat/history"], context?.previousMessages);
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/history"] });
      scrollToBottom();
    }
  });

  const renderMetadata = (msg: Message) => {
    if (!msg.metadata) return null;
    const { cryptoData, newsData } = msg.metadata;

    if (!cryptoData?.length && !newsData?.length) return null;

    return (
      <div className="mt-4 space-y-2 text-sm">
        {cryptoData && cryptoData.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-primary/80 font-medium">
              <TrendingUp className="w-4 h-4" />
              <span>Market Data</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {cryptoData.slice(0, 4).map((coin) => (
                <div key={coin.symbol} className="flex items-center justify-between bg-card/50 p-2 rounded">
                  <span>{coin.symbol}</span>
                  <span className="font-mono">${coin.current_price.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {newsData && newsData.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-primary/80 font-medium">
              <LineChart className="w-4 h-4" />
              <span>Latest News</span>
            </div>
            <div className="space-y-1">
              {newsData.slice(0, 2).map((news, i) => (
                <div key={i} className="text-xs text-muted-foreground">
                  {news.title}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-[calc(100vh-220px)]" type="always">
          <div className="px-4 py-4 space-y-4">
            {isLoadingHistory ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <>
                {messages.map((msg: Message) => (
                  <Card
                    key={msg.id}
                    className={`p-4 shadow-md ${
                      msg.role === "user"
                        ? "bg-transparent text-green-500 ml-auto max-w-[80%] border border-white/20"
                        : "bg-glass text-card-foreground mr-auto max-w-[80%] border border-white/20"
                    } rounded-2xl ${
                      msg.role === "user" ? "rounded-br-none" : "rounded-bl-none"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    {msg.role === "assistant" && renderMetadata(msg)}
                  </Card>
                ))}
                {mutation.isPending && (
                  <Card className="p-4 bg-glass animate-pulse mr-auto max-w-[80%] rounded-2xl rounded-bl-none border border-white/20">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <p>Analyzing market data...</p>
                    </div>
                  </Card>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="border-t bg-background/95 backdrop-blur-sm">
        <div className="p-4 max-w-3xl mx-auto">
          <MessageInput
            onSend={(content) => mutation.mutate(content)}
            isLoading={mutation.isPending}
          />
        </div>
      </div>
    </div>
  );
}