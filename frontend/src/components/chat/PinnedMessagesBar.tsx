import { useState, useMemo } from "react";
import type { PinnedMessage } from "@/types/chat";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/store/useChatStore";

interface PinnedMessagesBarProps {
  pinnedMessages: PinnedMessage[];
  onUnpin?: (messageId: string) => void;
  onNavigate?: (messageId: string) => void;
}

const PinnedMessagesBar = ({
  pinnedMessages,
  onUnpin,
  onNavigate,
}: PinnedMessagesBarProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { activeConversationId, messages: allMessages } = useChatStore();

  // Get actual messages from the store
  const messages = allMessages[activeConversationId!]?.items ?? [];
  
  // Map pinned messages to actual message content
  const pinnedMessagesWithContent = useMemo(() => {
    return pinnedMessages.map(pinned => {
      const actualMessage = messages.find(msg => msg._id === pinned.messageId);
      return {
        ...pinned,
        content: actualMessage?.content || null,
        imgUrl: actualMessage?.imgUrl || null,
      };
    });
  }, [pinnedMessages, messages]);

  if (!pinnedMessages || pinnedMessages.length === 0) {
    return null;
  }

  const currentPinned = pinnedMessagesWithContent[currentIndex];

  const handleNavigate = () => {
    onNavigate?.(currentPinned.messageId);
  };

  const handleUnpin = () => {
    onUnpin?.(currentPinned.messageId);
  };

  const getMessagePreview = (content: string | null, imgUrl: string | null) => {
    if (imgUrl) return "[Hình ảnh]";
    if (content) return content;
    return "Tin nhắn được ghim";
  };

  return (
    <div className="sticky top-0 z-20 bg-background border-b border-border">
      {/* Collapsed view */}
      <div className="px-4 py-2 flex items-center justify-between bg-muted/50">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-sm font-medium text-foreground">Tin ghim</span>
          <button
            onClick={handleNavigate}
            className="flex-1 text-left min-w-0 hover:text-primary transition-colors"
          >
            <p className="text-sm text-muted-foreground truncate">
              {getMessagePreview(currentPinned.content, currentPinned.imgUrl)}
            </p>
          </button>
        </div>

        <div className="flex items-center gap-1 ml-2">
          {pinnedMessages.length > 1 && (
            <>
              <span className="text-xs text-muted-foreground px-2">
                {currentIndex + 1}/{pinnedMessages.length}
              </span>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 hover:bg-muted rounded transition-colors"
                title={isExpanded ? "Thu gọn" : "Mở rộng"}
              >
                {isExpanded ? (
                  <ChevronUp className="size-4" />
                ) : (
                  <ChevronDown className="size-4" />
                )}
              </button>
            </>
          )}
          <button
            onClick={handleUnpin}
            className="p-1 hover:bg-destructive/10 hover:text-destructive rounded transition-colors"
            title="Bỏ ghim"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* Expanded view */}
      {isExpanded && pinnedMessages.length > 1 && (
        <div className="border-t border-border bg-background">
          <div className="max-h-48 overflow-y-auto">
            {pinnedMessagesWithContent.map((pinned, idx) => (
              <button
                key={pinned.messageId}
                onClick={() => {
                  setCurrentIndex(idx);
                  onNavigate?.(pinned.messageId);
                }}
                className={cn(
                  "w-full px-4 py-2 text-left border-b border-border/50 hover:bg-muted transition-colors",
                  idx === currentIndex && "bg-muted"
                )}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-foreground truncate flex-1">
                    {getMessagePreview(pinned.content, pinned.imgUrl)}
                  </p>
                  <span className="text-xs text-muted-foreground ml-2">
                    {pinned.pinnedBy.displayName}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(pinned.pinnedAt).toLocaleDateString("vi-VN")}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PinnedMessagesBar;

