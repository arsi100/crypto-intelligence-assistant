import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface InputAreaProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function InputArea({ onSend, disabled }: InputAreaProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input);
      setInput("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask about crypto prices, trends, or news..."
        disabled={disabled}
        className="flex-1"
      />
      <Button type="submit" disabled={disabled}>
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
