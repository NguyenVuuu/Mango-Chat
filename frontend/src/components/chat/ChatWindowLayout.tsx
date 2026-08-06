import { useChatStore } from "@/store/useChatStore";
import ChatWelcomeScreen from "./ChatWelcomeScreen";
import ChatWindowSkeleton from "./ChatWindowSkeleton";
import { SidebarInset } from "../ui/sidebar";
import ChatWindowHeader from "./ChatWindowHeader";
import ChatWindowBody from "./ChatWindowBody";
import MessageInput from "./MessageInput";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";

const ChatWindowLayout = () => {
  const {
    activeConversationId,
    conversations,
    messageLoading: loading,
    markAsSeen,
  } = useChatStore();

  const { user } = useAuthStore();

  const selectedConver =
    conversations.find((c) => c._id === activeConversationId) ?? null;

  useEffect(() => {
    if (!selectedConver) {
      return;
    }

    const markSeen = async () => {
      try {
        await markAsSeen();
        console.log("da danh dau da doc");
      } catch (error) {
        console.error("loi khi danh dau da doc", error);
      }
    };
    //goi ham markSeen
    markSeen();
  }, [markAsSeen, selectedConver, user]);

  if (!selectedConver) {
    return <ChatWelcomeScreen />;
  }

  if (loading) {
    return <ChatWindowSkeleton />;
  }

  return (
    <SidebarInset className="flex flex-col h-full flex-1 overflow-hidden bg-background">
      {/* Header */}
      <ChatWindowHeader chat={selectedConver} />
      
      {/* Content */}
      <div className="flex-1 overflow-hidden bg-gradient-to-b from-background to-muted/20">
        <ChatWindowBody />
      </div>
      
      {/* Footer */}
      <div className="border-t border-border/50 bg-background">
        <MessageInput selectedConver={selectedConver} />
      </div>
    </SidebarInset>
  );
};

export default ChatWindowLayout;
