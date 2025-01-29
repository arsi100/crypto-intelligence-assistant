import { cn } from "@/lib/utils";
import type { Message } from "@/lib/types";
import { format } from "date-fns";

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  return (
    <div
      className={cn(
        "mb-4 flex",
        message.isAi ? "justify-start" : "justify-end"
      )}
    >
      <div
        className={cn(
          "rounded-lg px-4 py-2 max-w-[80%]",
          message.isAi
            ? "bg-secondary text-secondary-foreground"
            : "bg-primary text-primary-foreground"
        )}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>
        <div className="text-xs mt-1 opacity-70">
          {format(new Date(message.timestamp), "HH:mm")}
        </div>
      </div>
    </div>
  );
}
