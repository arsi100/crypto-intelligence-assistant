import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMessageHistory, sendMessage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import MessageBubble from "./message-bubble";
import InputArea from "./input-area";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Message } from "@/lib/types";
import { useEffect, useRef } from "react";

export default function ChatWindow() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messages = [] } = useQuery({
    queryKey: ["/api/messages"],
    staleTime: 0,
  });

  const mutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (content: string) => {
    if (content.trim()) {
      mutation.mutate(content);
    }
  };

  return (
    <div className="h-[80vh] flex flex-col">
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        {messages.map((message: Message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {mutation.isPending && (
          <MessageBubble
            message={{
              id: -1,
              content: "Thinking...",
              isAi: true,
              timestamp: new Date().toISOString(),
            }}
          />
        )}
      </ScrollArea>
      <InputArea onSend={handleSend} disabled={mutation.isPending} />
    </div>
  );
}
