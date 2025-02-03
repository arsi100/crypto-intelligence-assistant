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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [pendingMessage, setPendingMessage] = useState<Message | null>(null);

  const { data: messages = [], isLoading } = useQuery({
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

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Auto-scroll when messages change or during thinking state
  useEffect(() => {
    // Initial scroll
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
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4 min-h-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <span>Loading messages...</span>
            </div>
          ) : (
            <>
              {displayMessages.map((message) => (
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
              <div ref={messagesEndRef} className="h-4" />
            </>
          )}
        </div>
      </ScrollArea>
      <InputArea onSend={handleSend} disabled={mutation.isPending} />
    </div>
  );
}