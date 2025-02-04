import { useEffect, useRef } from "react";
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

  // Get current messages
  const { data: messages = [], isLoading: isLoadingHistory } = useQuery({
    queryKey: ["/api/chat/history"],
    initialData: [], // Provide empty array as initial data
  });

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current;
      setTimeout(() => {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }, 100); // Small delay to ensure content is rendered
    }
  };

  const mutation = useMutation({
    mutationFn: sendChatMessage,
    onMutate: async (newMessage) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["/api/chat/history"] });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData(["/api/chat/history"]);

      // Optimistically update to the new value
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
      // Revert to the previous value if there's an error
      queryClient.setQueryData(["/api/chat/history"], context?.previousMessages);
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/history"] });
    },
    onSettled: () => {
      scrollToBottom();
    }
  });

  // Scroll to bottom on initial load and when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

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
              {messages.map((msg: any) => (
                <Card
                  key={msg.id}
                  className={`p-4 ${
                    msg.role === "user"
                      ? "bg-primary/90 text-primary-foreground"
                      : "bg-secondary/80 text-secondary-foreground"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </Card>
              ))}
              {mutation.isPending && (
                <Card className="p-4 bg-secondary/40 animate-pulse">
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