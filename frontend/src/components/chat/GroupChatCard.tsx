import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import type { Conversation } from "@/types/chat";
import ChatCard from "./ChatCard";
import UnreadCountBadge from "./UnreadCountBadge";
import GroupChatAvatar from "./GroupChatAvatar";

const GroupChatCard = ({ conver }: { conver: Conversation }) => {
  const { user } = useAuthStore();

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

  const unreadCount = conver.unreadCounts[user._id];
  const name = conver.group?.name ?? "";
  const lastMessage = conver.lastMessage?.isRecalled
    ? "Tin nhắn đã được thu hồi"
    : conver.lastMessage?.content ?? "";

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
        name={name}
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
            {unreadCount > 0 && <UnreadCountBadge unreadCount={unreadCount} />}
            <GroupChatAvatar participants={conver.participants} type="chat" />
          </div>
        }
        subtitle={
          <p className="text-sm truncate to-muted-foreground">{lastMessage}</p>
        }
      />
    </div>
  );
};

export default GroupChatCard;
