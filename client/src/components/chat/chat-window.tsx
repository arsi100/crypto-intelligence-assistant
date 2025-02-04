import { useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageInput } from "./message-input";
import { sendChatMessage, getChatHistory } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export function ChatWindow() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current messages
  const { data: messages = [], isLoading: isLoadingHistory } = useQuery({
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
        id: `temp-${Date.now()}`,
        content: newMessage,
        role: "user",
        timestamp: new Date().toISOString()
      };

      queryClient.setQueryData(["/api/chat/history"], (old: any[] = []) => [...old, optimisticMessage]);
      scrollToBottom();
      return { previousMessages };
    },
    onError: (error, _, context) => {
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

  return (
    <div className="flex flex-col h-full bg-chat-pattern">
      <ScrollArea 
        className="flex-1 p-4 bg-gradient-to-b from-background/95 to-background/90 backdrop-blur-sm"
      >
        <div className="space-y-4 max-w-3xl mx-auto">
          {isLoadingHistory ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <>
              {messages.map((msg: any) => (
                <Card
                  key={msg.id}
                  className={`p-4 shadow-md backdrop-blur-sm ${
                    msg.role === "user"
                      ? "bg-primary/90 text-primary-foreground ml-12"
                      : "bg-muted/90 text-muted-foreground mr-12"
                  } rounded-2xl ${
                    msg.role === "user" ? "rounded-tr-sm" : "rounded-tl-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </Card>
              ))}
              {mutation.isPending && (
                <Card className="p-4 bg-muted/40 animate-pulse mr-12 rounded-2xl rounded-tl-sm backdrop-blur-sm">
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

      <div className="p-4 border-t bg-background/95 backdrop-blur-sm">
        <MessageInput
          onSend={(content) => mutation.mutate(content)}
          isLoading={mutation.isPending}
        />
      </div>
    </div>
  );
}