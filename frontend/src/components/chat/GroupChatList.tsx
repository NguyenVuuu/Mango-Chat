import { useChatStore } from "@/store/useChatStore";
import GroupChatCard from "./GroupChatCard";

const GroupChatList = () => {
  const { conversations } = useChatStore();

  if (!conversations) {
    return;
  }
  const groupConversations = conversations.filter(
    (conver) => conver.type === "group"
  );
  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-2">
      {groupConversations.map((conver) => (
        <GroupChatCard conver={conver} key={conver._id} />
      ))}
    </div>
  );
};

export default GroupChatList;
