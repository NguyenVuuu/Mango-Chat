import { useChatStore } from "@/store/useChatStore";
import type { Conversation } from "@/types/chat";
import type { User } from "@/types/user";
import { SidebarTrigger } from "../ui/sidebar";
import { useAuthStore } from "@/store/useAuthStore";
import { Separator } from "../ui/separator";
import UserAvatar from "./UserAvatar";
import GroupChatAvatar from "./GroupChatAvatar";
import StatusBadge from "./StatusBadge";
import { useSocketStore } from "@/store/useSocketStore";
import { useState } from "react";
import OtherUserProfileDialog from "../profile/OtherUserProfileDialog";

const ChatWindowHeader = ({ chat }: { chat?: Conversation }) => {
  const { conversations, activeConversationId } = useChatStore();
  const { user } = useAuthStore();
  const { onlineUsers } = useSocketStore();
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  let otherUser;

  chat = chat ?? conversations.find((c) => c._id === activeConversationId);

  if (!chat) {
    return (
      <header className="md:hidden flex items-center gap-2 px-4 py-2 w-full sticky top-0 z-10">
        <SidebarTrigger className="-ml-1 text-foreground" />
      </header>
    );
  }

  if (chat.type === "direct") {
    const otherUsers = chat.participants.filter((p) => p._id !== user?._id);
    otherUser = otherUsers.length > 0 ? otherUsers[0] : null;

    if (!user || !otherUser) {
      return;
    }
  }
  return (
    <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50">
      <div className="flex items-center gap-3 px-4 py-3">
        <SidebarTrigger className="-ml-1 text-foreground" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        
        {/* Avatar */}
        <div
          className="relative cursor-pointer"
          onClick={() => chat.type === "direct" && setShowProfileDialog(true)}
        >
          {chat.type === "direct" ? (
            <>
              <UserAvatar
                type="sidebar"
                name={otherUser?.displayName || "Mango"}
                avatarUrl={otherUser?.avatarUrl || undefined}
              />
              <StatusBadge
                status={
                  onlineUsers.includes(otherUser?._id ?? "")
                    ? "online"
                    : "offline"
                }
              />
            </>
          ) : (
            <GroupChatAvatar participants={chat.participants} type="sidebar" />
          )}
        </div>
        
        {/* Name and Info */}
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-foreground truncate">
            {chat.type === "direct" ? otherUser?.displayName : chat.group?.name}
          </h2>
          {chat.type === "direct" && (
            <p className="text-xs text-muted-foreground">
              {onlineUsers.includes(otherUser?._id ?? "") ? "Đang hoạt động" : "Không hoạt động"}
            </p>
          )}
        </div>
      </div>

      {/* Other User Profile Dialog */}
      {chat.type === "direct" && otherUser && (
        <OtherUserProfileDialog
          open={showProfileDialog}
          setOpen={setShowProfileDialog}
          user={
            {
              _id: otherUser._id,
              username: "",
              email: "",
              displayName: otherUser.displayName,
              avatarUrl: otherUser.avatarUrl,
            } as User
          }
        />
      )}
    </header>
  );
};

export default ChatWindowHeader;
