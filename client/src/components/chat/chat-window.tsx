import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMessageHistory, sendMessage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import MessageBubble from "./message-bubble";
import InputArea from "./input-area";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Message } from "@/lib/types";
import { useEffect, useRef, useState } from "react";

export default function ChatWindow() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pendingMessage, setPendingMessage] = useState<Message | null>(null);

  const { data: messages = [] } = useQuery({
    queryKey: ["/api/messages"],
    staleTime: 0,
  });

  // Combine server messages with pending message
  const displayMessages = pendingMessage 
    ? [...messages, pendingMessage]
    : messages;

  const mutation = useMutation({
    mutationFn: sendMessage,
    onMutate: async (content: string) => {
      // Optimistically add user message
      const newMessage: Message = {
        id: Date.now(),
        content,
        isAi: false,
        timestamp: new Date().toISOString(),
      };
      setPendingMessage(newMessage);
    },
    onSuccess: () => {
      setPendingMessage(null);
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
    onError: () => {
      setPendingMessage(null);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Auto-scroll when messages change or during thinking state
  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    };

    scrollToBottom();
    // Add a small delay to ensure content is rendered
    const timeoutId = setTimeout(scrollToBottom, 100);

    return () => clearTimeout(timeoutId);
  }, [displayMessages, mutation.isPending]);

  const handleSend = async (content: string) => {
    if (content.trim()) {
      mutation.mutate(content);
    }
  };

  return (
    <div className="h-[80vh] flex flex-col">
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        {displayMessages.map((message: Message) => (
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