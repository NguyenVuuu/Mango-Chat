import type { Conversation } from "@/types/chat";
import ChatCard from "./ChatCard";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import { cn } from "@/lib/utils";
import UserAvatar from "./UserAvatar";
import StatusBadge from "./StatusBadge";
import UnreadCountBadge from "./UnreadCountBadge";
import { useSocketStore } from "@/store/useSocketStore";

const DirrectMessageCard = ({ conver }: { conver: Conversation }) => {
  const { user } = useAuthStore();
  const { onlineUsers } = useSocketStore();
  const {
    activeConversationId,
    setActiveConversation,
    messages,
    fetchMessages,
  } = useChatStore();

  if (!user) {
    console.log("chua co user");

    return null;
  }

  const otherUser = conver.participants.find((p) => p._id !== user._id);

  if (!otherUser) {
    console.log("khong tim thay user khac");
    return null;
  }
  const unreadCount = conver.unreadCounts[user._id];
  const lastMessage = conver.lastMessage?.isRecalled
    ? "Tin nhắn đã được thu hồi"
    : (conver.lastMessage?.content ?? "");

  const handleSelectConversation = async (id: string) => {
    setActiveConversation(id);
    if (!messages[id]) {
      await fetchMessages(id);
    }
  };
  return (
    <div>
      <ChatCard
        converId={conver._id}
        name={otherUser.displayName}
        timestamp={
          conver.lastMessage?.createdAt
            ? new Date(conver.lastMessage.createdAt)
            : undefined
        }
        isActive={activeConversationId === conver._id}
        onSelect={handleSelectConversation}
        unreadCount={unreadCount}
        leftSection={
          <div>
            <UserAvatar
              type="sidebar"
              name={otherUser.displayName ?? ""}
              avatarUrl={otherUser.avatarUrl ?? ""}
            />
            <StatusBadge
              status={
                onlineUsers.includes(otherUser?._id ?? "")
                  ? "online"
                  : "offline"
              }
            />
            {unreadCount > 0 && <UnreadCountBadge unreadCount={unreadCount} />}
          </div>
        }
        subtitle={
          <p
            className={cn(
              "text-sm truncate",
              unreadCount > 0
                ? "font-medium text-foreground"
                : "text-muted-foreground",
            )}
          >
            {lastMessage}
          </p>
        }
      />
    </div>
  );
};

export default DirrectMessageCard;
