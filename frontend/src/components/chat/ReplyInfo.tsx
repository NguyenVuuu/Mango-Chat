import type { Message } from "@/types/chat";
import { cn } from "@/lib/utils";

interface ReplyInfoProps {
  replyTo: Message["replyTo"];
  onNavigate?: () => void;
}

const ReplyInfo = ({ replyTo, onNavigate }: ReplyInfoProps) => {
  if (!replyTo) {
    return null;
  }

  return (
    <div
      onClick={onNavigate}
      className={cn(
        "flex items-start gap-2 px-2 py-1.5 bg-muted/50 border-l-3 border-primary rounded-sm mb-1",
        onNavigate && "cursor-pointer hover:bg-muted/70 transition-colors"
      )}
    >
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-primary">{replyTo.senderName}</p>
        <p className="text-xs text-muted-foreground truncate">
          {replyTo.content || "[Hình ảnh]"}
        </p>
      </div>
    </div>
  );
};

export default ReplyInfo;
