import { useAuthStore } from "@/store/useAuthStore";
import { isOwnMessage, getSenderId } from "@/lib/message";
import type { Message, Conversation } from "@/types/chat";
import { X } from "lucide-react";

interface ReplyPreviewProps {
  message: Message | null;
  selectedConver?: Conversation;
  onClear?: () => void;
}

const ReplyPreview = ({
  message,
  selectedConver,
  onClear,
}: ReplyPreviewProps) => {
  const { user } = useAuthStore();

  if (!message) {
    return null;
  }

  const isOwn = isOwnMessage(message.senderId, user?._id);

  // Get sender name
  let senderName = "";
  if (isOwn) {
    senderName = "";
  } else {
    const sender = selectedConver?.participants.find(
      (p) => p._id === getSenderId(message.senderId)
    );
    senderName = sender?.displayName || "Unknown";
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border-l-4 border-primary">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground">
          {isOwn ? "Trả lời" : `Trả lời ${senderName}`}
        </p>
        <p className="text-sm text-muted-foreground truncate">
          {message.content || "[Hình ảnh]"}
        </p>
      </div>
      <button
        onClick={onClear}
        className="p-1 hover:bg-background rounded transition-colors shrink-0"
        title="Hủy trả lời"
      >
        <X className="size-4" />
      </button>
    </div>
  );
};

export default ReplyPreview;
