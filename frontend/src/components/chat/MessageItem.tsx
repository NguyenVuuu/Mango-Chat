import { cn, formatOnlineTime } from "@/lib/utils";
import type { Conversation, Message } from "@/types/chat";
import type { User } from "@/types/user";
import UserAvatar from "./UserAvatar";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import ReactionDisplay from "./ReactionDisplay";
import EmojiReactionBar from "./EmojiReactionBar";
import ReplyInfo from "./ReplyInfo";
import MessageOptionsModal from "./MessageOptionsModal";
import SystemMessage from "./SystemMessage";
import { useState } from "react";
import { chatService } from "@/services/chatService";
import { useChatStore } from "@/store/useChatStore";
import { Smile, Reply } from "lucide-react";
import { toast } from "sonner";
import OtherUserProfileDialog from "../profile/OtherUserProfileDialog";
import { useAuthStore } from "@/store/useAuthStore";
import { isOwnMessage, getSenderId } from "@/lib/message";

interface MessageItemProps {
  message: Message;
  index: number;
  messages: Message[];
  selectedConver: Conversation;
  lastMessageStatus: "đã gửi" | "đã xem";
  onReply?: (message: Message) => void;
  onPin?: (message: Message) => void;
  onUnpin?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
}

// Helper functions for time divider logic
const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const isSystemMessage = (message: Message): boolean => {
  // Kiểm tra xem có phải system message không dựa vào content
  if (!message.content) return false;

  const systemKeywords = [
    "đã thêm",
    "đã rời khỏi",
    "đã thu hồi",
    "cuộc gọi",
    "đã tham gia",
    "đã xóa",
    "đã đổi tên nhóm",
    "đã thay đổi ảnh nhóm",
    "đã rời nhóm",
    "đã thêm thành viên",
    "đã xóa thành viên"
  ];

  return systemKeywords.some(keyword =>
    message.content?.toLowerCase().includes(keyword.toLowerCase())
  );
};

const formatTimeDivider = (date: Date, prevDate?: Date): string => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  // Nếu khác ngày với tin nhắn trước
  if (prevDate && !isSameDay(date, prevDate)) {
    if (messageDate.getTime() === today.getTime()) {
      return "Hôm nay";
    } else if (messageDate.getTime() === yesterday.getTime()) {
      return "Hôm qua";
    } else {
      // Kiểm tra nếu trong tuần này
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      if (messageDate > weekAgo) {
        return date.toLocaleDateString("vi-VN", { weekday: "long" });
      } else {
        return date.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      }
    }
  }

  // Nếu cùng ngày hoặc là tin nhắn đầu tiên, hiển thị giờ
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const shouldShowTimeDivider = (
  currentMessage: Message,
  prevMessage: Message | undefined,
  isFirstMessage: boolean
): boolean => {
  // Quy tắc 1: Tin nhắn đầu tiên của cuộc trò chuyện
  if (isFirstMessage) {
    return true;
  }

  if (!prevMessage) {
    return true;
  }

  const currentDate = new Date(currentMessage.createdAt);
  const prevDate = new Date(prevMessage.createdAt);

  // Quy tắc 4: Nếu tin nhắn trước đó là system message
  if (isSystemMessage(prevMessage)) {
    return true;
  }

  // Quy tắc 2: Nếu khác ngày với tin nhắn ngay trước đó
  if (!isSameDay(currentDate, prevDate)) {
    return true;
  }

  // Quy tắc 3: Nếu cùng ngày nhưng khoảng cách thời gian ≥ 10 phút
  const timeDiff = currentDate.getTime() - prevDate.getTime();
  if (timeDiff >= 10 * 60 * 1000) { // 10 phút = 600000ms
    return true;
  }

  // Quy tắc 5: Nếu không thỏa bất kỳ điều kiện nào ở trên → KHÔNG hiển thị
  return false;
};
const MessageItem = ({
  message,
  index,
  messages,
  selectedConver,
  lastMessageStatus,
  onReply,
  onPin,
  onUnpin,
  onDelete,
}: MessageItemProps) => {
  const { user } = useAuthStore();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isLoadingReaction, setIsLoadingReaction] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const deleteMessageFromStore = useChatStore((state) => state.deleteMessage);

  // Logic mới để xác định có hiển thị mốc thời gian hay không
  // Trong mảng đã reverse: index 0 = tin nhắn mới nhất, index cao hơn = tin nhắn cũ hơn
  // Tin nhắn trước đó (tin nhắn cũ hơn) để so sánh
  const prevMessage = index + 1 < messages.length ? messages[index + 1] : undefined;
  const isFirstMessage = index === messages.length - 1; // Tin nhắn đầu tiên (cũ nhất)

  // Áp dụng logic mới để quyết định hiển thị mốc thời gian
  const shouldShowTime = shouldShowTimeDivider(message, prevMessage, isFirstMessage);

  // Ngắt nhóm tin nhắn nếu hiển thị thời gian hoặc người gửi khác nhau với tin nhắn trước
  const isGroupBreak = shouldShowTime || message.senderId !== prevMessage?.senderId;

  const participant = selectedConver.participants.find(
    (p) => p._id.toString() === getSenderId(message.senderId),
  );
  const isOwn = isOwnMessage(message.senderId, user?._id);

  const handleReactionSelect = async (emoji: string) => {
    try {
      setIsLoadingReaction(true);
      await chatService.addReaction(message._id, emoji);
      setShowEmojiPicker(false);
    } catch (error) {
      console.error("loi khi them reaction", error);
    } finally {
      setIsLoadingReaction(false);
    }
  };

  const handleCopy = () => {
    if (message.content) {
      navigator.clipboard.writeText(message.content);
    }
  };

  const handleReply = () => {
    onReply?.(message);
  };

  const handlePin = () => {
    onPin?.(message);
  };

  const handleUnpin = () => {
    onUnpin?.(message._id);
  };

  const handleDelete = async () => {
    try {
      await chatService.deleteMessage(message._id);
      deleteMessageFromStore(message._id);
      onDelete?.(message._id);
      toast.success("Xóa tin nhắn thành công");
    } catch (error) {
      console.error("Lỗi khi xóa tin nhắn:", error);
      toast.error("Xóa tin nhắn thất bại");
    }
  };

  const handleNavigateToReply = () => {
    if (message.replyTo?._id) {
      const replyElement = document.getElementById(
        `message-${message.replyTo._id}`,
      );
      if (replyElement) {
        replyElement.scrollIntoView({ behavior: "smooth", block: "center" });
        replyElement.classList.add("highlight-message");
        setTimeout(() => {
          replyElement.classList.remove("highlight-message");
        }, 2000);
      }
    }
  };

  const handleMark = () => {
    toast.info("Đánh dấu tin nhắn");
  };

  const handleSelect = () => {
    toast.info("Chọn nhiều tin nhắn");
  };

  const handleViewDetails = () => {
    toast.info(
      `Tin nhắn được gửi lúc: ${formatOnlineTime(new Date(message.createdAt))}`,
    );
  };

  const handleAvatarClick = () => {
    if (!isOwn) {
      setShowProfileDialog(true);
    }
  };

  const handleRecall = async () => {
    try {
      await chatService.recallMessage(message._id);
      toast.success("Thu hồi tin nhắn thành công");
    } catch (error) {
      console.error("Lỗi khi thu hồi tin nhắn:", error);
      toast.error("Thu hồi tin nhắn thất bại");
    }
  };

  // Handle system messages
  if (message.messageType === "system") {
    return (
      <SystemMessage 
        message={message} 
        senderName={participant?.displayName}
      />
    );
  }

  return (
    <>
      {/* Time Divider */}
      {shouldShowTime && (
        <div className="flex justify-center my-4">
          <span className="text-xs text-muted-foreground bg-background px-3 py-1 rounded-full border border-border/50">
            {formatTimeDivider(new Date(message.createdAt), prevMessage ? new Date(prevMessage.createdAt) : undefined)}
          </span>
        </div>
      )}

      <div
        className={cn(
          "flex gap-3 message-bounce mb-2 group/message px-2",
          isOwn ? "justify-end" : "justify-start",
        )}
      >
        {/* Avatar */}
        {!isOwn && (
          <div className="w-8 cursor-pointer" onClick={handleAvatarClick}>
            {isGroupBreak && (
              <UserAvatar
                name={participant?.displayName ?? "Mango"}
                avatarUrl={participant?.avatarUrl ?? undefined}
                type="chat"
              />
            )}
          </div>
        )}

        {/* Message Content */}
        <div
          className={cn(
            "max-w-xs lg:max-w-md space-y-1 flex flex-col group",
            isOwn ? "items-end" : "items-start",
          )}
        >
          <div className="relative">
            <Card
              className={cn(
                "p-3 shadow-sm",
                isOwn
                  ? "chat-bubble-sent border-0"
                  : "chat-bubble-received",
                message.isRecalled && "opacity-60",
              )}
            >
              {/* Reply info */}
              {!message.isRecalled && (
                <ReplyInfo
                  replyTo={message.replyTo}
                  onNavigate={handleNavigateToReply}
                />
              )}

              {message.isRecalled ? (
                <p className="text-sm text-muted-foreground italic">
                  Tin nhắn đã được thu hồi
                </p>
              ) : (
                <>
                  {message.imgUrl && (
                    <img
                      src={message.imgUrl}
                      alt="Message image"
                      className="max-w-xs lg:max-w-sm rounded-lg mb-2 cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() =>
                        message.imgUrl && window.open(message.imgUrl, "_blank")
                      }
                    />
                  )}
                  {message.content && (
                    <p className="text-sm leading-relaxed break-words">
                      {message.content}
                    </p>
                  )}
                </>
              )}
            </Card>

            {/* Reaction bar - show on hover */}
            {showEmojiPicker && !message.isRecalled && (
              <div
                className={cn(
                  "absolute top-full mt-2 z-50",
                  isOwn ? "right-0" : "left-0",
                )}
              >
                <EmojiReactionBar
                  onEmojiSelect={handleReactionSelect}
                  isLoading={isLoadingReaction}
                />
              </div>
            )}

            {/* Action bar - show on hover */}
            <div
              className={cn(
                "absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-background border border-border rounded-lg p-1 shadow-md z-40",
                isOwn ? "right-0" : "left-0",
              )}
            >
              {!message.isRecalled && (
                <button
                  onClick={handleReply}
                  className="p-1.5 rounded hover:bg-muted transition-colors"
                  title="Trả lời"
                >
                  <Reply className="size-4" />
                </button>
              )}
              <MessageOptionsModal
                message={message}
                pinnedMessages={selectedConver.pinnedMessages}
                onCopy={handleCopy}
                onPin={handlePin}
                onUnpin={handleUnpin}
                onMark={handleMark}
                onSelect={handleSelect}
                onViewDetails={handleViewDetails}
                onDelete={handleDelete}
                onRecall={handleRecall}
              />
            </div>

            {/* Emoji button - show on hover */}
            {!message.isRecalled && (
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                disabled={isLoadingReaction}
                className={cn(
                  "absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-muted",
                  isOwn ? "right-full pr-2" : "left-full pl-2",
                )}
                title="Thêm cảm xúc"
              >
                <Smile className="size-4" />
              </button>
            )}
          </div>

          {/* Reactions display */}
          <ReactionDisplay
            reactions={message.reactions}
            onReactionClick={handleReactionSelect}
          />

          {/* Status: seen/delivered */}
          {isOwn && message._id === selectedConver.lastMessage?._id && (
            <Badge
              variant="outline"
              className={cn(
                "text-xs px-2 py-0.5 h-5 border-0",
                lastMessageStatus === "đã xem"
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {lastMessageStatus}
            </Badge>
          )}
        </div>
      </div>

      {/* Other User Profile Dialog */}
      {participant && (
        <OtherUserProfileDialog
          open={showProfileDialog}
          setOpen={setShowProfileDialog}
          user={
            {
              _id: participant._id,
              username: "",
              email: "",
              displayName: participant.displayName,
              avatarUrl: participant.avatarUrl,
            } as User
          }
        />
      )}
    </>
  );
};

export default MessageItem;
