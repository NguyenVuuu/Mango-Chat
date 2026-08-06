import type { Message, PinnedMessage } from "@/types/chat";
import { useAuthStore } from "@/store/useAuthStore";
import { isOwnMessage } from "@/lib/message";
import {
  Copy,
  Pin,
  PinOff,
  Flag,
  CheckSquare,
  Clock,
  MoreHorizontal,
  Trash2,
  RotateCcw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";

interface MessageOptionsModalProps {
  message: Message;
  pinnedMessages?: PinnedMessage[];
  onCopy?: () => void;
  onPin?: () => void;
  onUnpin?: () => void;
  onMark?: () => void;
  onSelect?: () => void;
  onViewDetails?: () => void;
  onDelete?: () => void;
  onRecall?: () => void;
}

const MessageOptionsModal = ({
  message,
  pinnedMessages = [],
  onCopy,
  onPin,
  onUnpin,
  onMark,
  onSelect,
  onViewDetails,
  onDelete,
  onRecall,
}: MessageOptionsModalProps) => {
  const { user } = useAuthStore();
  const isOwn = isOwnMessage(message.senderId, user?._id);
  const isPinned = pinnedMessages.some(
    (pinned) => pinned.messageId === message._id,
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-1.5 rounded hover:bg-muted transition-colors">
          <MoreHorizontal className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {/* If message is recalled, only show delete option */}
        {message.isRecalled ? (
          <>
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="size-4 mr-2" />
              <span>Xóa ở phía tôi</span>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            {/* Copy */}
            <DropdownMenuItem onClick={onCopy}>
              <Copy className="size-4 mr-2" />
              <span>Copy tin nhắn</span>
            </DropdownMenuItem>

            {/* Pin/Unpin */}
            {isPinned ? (
              <DropdownMenuItem onClick={onUnpin}>
                <PinOff className="size-4 mr-2" />
                <span>Bỏ ghim tin nhắn</span>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={onPin}>
                <Pin className="size-4 mr-2" />
                <span>Ghim tin nhắn</span>
              </DropdownMenuItem>
            )}

            {/* Mark */}
            <DropdownMenuItem onClick={onMark}>
              <Flag className="size-4 mr-2" />
              <span>Đánh dấu tin nhắn</span>
            </DropdownMenuItem>

            {/* Select */}
            <DropdownMenuItem onClick={onSelect}>
              <CheckSquare className="size-4 mr-2" />
              <span>Chọn nhiều tin nhắn</span>
            </DropdownMenuItem>

            {/* View Details */}
            <DropdownMenuItem onClick={onViewDetails}>
              <Clock className="size-4 mr-2" />
              <span>Xem chi tiết</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* More Options Submenu */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <MoreHorizontal className="size-4 mr-2" />
                <span>Tuy chọn khác</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>
                  <span>Tùy chọn 1</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Tùy chọn 2</span>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />

            {/* Delete */}
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="size-4 mr-2" />
              <span>Xóa ở phía tôi</span>
            </DropdownMenuItem>

            {/* Recall - only for own messages */}
            {isOwn && (
              <DropdownMenuItem onClick={onRecall} className="text-destructive">
                <RotateCcw className="size-4 mr-2" />
                <span>Thu hồi tin nhắn</span>
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MessageOptionsModal;
