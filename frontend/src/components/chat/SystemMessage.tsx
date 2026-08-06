import type { Message } from "@/types/chat";
import { Pin, PinOff } from "lucide-react";

interface SystemMessageProps {
  message: Message;
  senderName?: string;
}

const SystemMessage = ({ message, senderName }: SystemMessageProps) => {
  const getSystemMessageIcon = () => {
    switch (message.systemMessageType) {
      case "pin":
        return <Pin className="size-3 text-muted-foreground" />;
      case "unpin":
        return <PinOff className="size-3 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const getSystemMessageText = () => {
    const name = senderName || "Ai đó";
    switch (message.systemMessageType) {
      case "pin":
        return `${name} ${message.content}`;
      case "unpin":
        return `${name} ${message.content}`;
      default:
        return message.content;
    }
  };

  return (
    <div className="flex justify-center my-2">
      <div className="flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-full border border-border/50">
        {getSystemMessageIcon()}
        <span className="text-xs text-muted-foreground">
          {getSystemMessageText()}
        </span>
      </div>
    </div>
  );
};

export default SystemMessage;