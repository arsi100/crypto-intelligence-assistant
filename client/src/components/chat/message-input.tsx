import { useState, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendIcon } from "lucide-react";
import { Loader2 } from "lucide-react";

interface MessageInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
}

export function MessageInput({ onSend, isLoading }: MessageInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (message.trim() && !isLoading) {
        onSend(message.trim());
        setMessage("");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Ask about crypto markets..."
        className="resize-none min-h-[80px]"
        disabled={isLoading}
      />
      <Button
        type="submit"
        disabled={isLoading || !message.trim()}
        className="bg-transparent border border-white/20 hover:bg-green-500/10"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-green-500" />
        ) : (
          <SendIcon className="h-4 w-4 text-green-500" />
        )}
      </Button>
    </form>
  );
}