import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendIcon } from "lucide-react";

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

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ask about crypto markets..."
        className="resize-none"
        rows={2}
      />
      <Button type="submit" disabled={isLoading || !message.trim()}>
        <SendIcon className="h-4 w-4" />
      </Button>
    </form>
  );
}
