import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageInput } from "./message-input";
import { sendChatMessage, getChatHistory } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export function ChatWindow() {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [localMessages, setLocalMessages] = useState<any[]>([]);

  const { data: messages, isLoading: isLoadingHistory } = useQuery({
    queryKey: ["/api/chat/history"],
    onSuccess: (data) => {
      setLocalMessages(data || []);
    },
  });

  const mutation = useMutation({
    mutationFn: sendChatMessage,
    onMutate: async (newMessage) => {
      // Add user message immediately to local state
      setLocalMessages(prev => [...prev, {
        id: Date.now(),
        role: 'user',
        content: newMessage
      }]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/history"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    // Scroll to bottom whenever messages change or during loading
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current;
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [localMessages, mutation.isPending]);

  return (
    <div className="flex flex-col h-full">
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {isLoadingHistory ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <>
              {localMessages.map((msg: any) => (
                <Card
                  key={msg.id}
                  className={`p-4 ${
                    msg.role === "user" 
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </Card>
              ))}
              {mutation.isPending && (
                <Card className="p-4 bg-muted/60">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <p>Analyzing market data...</p>
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <MessageInput
          onSend={(content) => mutation.mutate(content)}
          isLoading={mutation.isPending}
        />
      </div>
    </div>
  );
}