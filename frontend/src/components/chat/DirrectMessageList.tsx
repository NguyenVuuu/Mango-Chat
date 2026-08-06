import { useChatStore } from "@/store/useChatStore";
import DirrectMessageCard from "./DirrectMessageCard";

const DirrectMessageList = () => {
  const { conversations } = useChatStore();

  //neu 0 co du lieu trong conversation thi return luon
  if (!conversations) {
    return;
  }

  //loc nhung conversation co type la direct
  const directConversations = conversations.filter(
    (conver) => conver.type === "direct"
  );

  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-2">
      {directConversations.map((conver) => (
        <DirrectMessageCard conver={conver} key={conver._id} />
      ))}
    </div>
  );
};

export default DirrectMessageList;
