import { useFriendStore } from "@/store/useFriendStore";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "../ui/dialog";
import { MessageCircleMore } from "lucide-react";
import { Card } from "../ui/card";
import UserAvatar from "../chat/UserAvatar";
import { useChatStore } from "@/store/useChatStore";
import { useRef } from "react";

const FriendListModal = () => {
  const { friends } = useFriendStore();
  const { createConversation } = useChatStore();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const handleAddConversation = async (friendId: string) => {
    await createConversation("direct", "", [friendId]);
    // Đóng dialog sau khi tạo conversation
    closeButtonRef.current?.click();
  };

  return (
    <DialogContent className="glass max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-xl capitalize">
          <MessageCircleMore className="size-5" />
          Bắt đầu hội thoại mới
        </DialogTitle>
      </DialogHeader>

      {/* danh sach ban be */}
      <div className="space-y-4">
        <h1 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
          Danh sách bạn bè
        </h1>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {friends.map((fr) => (
            <Card
              key={fr._id}
              className="p-3 transition-smooth hover:shadow-soft glass hover:bg-muted/30 cursor-pointer group/friendCard "
              onClick={() => handleAddConversation(fr._id)}
            >
              <div className="flex items-center gap-3">
                {/* avatar */}
                <div className="relative">
                  <UserAvatar
                    type="sidebar"
                    name={fr.displayName}
                    avatarUrl={fr.avatarUrl}
                  />
                </div>
                {/* info */}
                <div className="flex flex-1 flex-col min-w-0">
                  <h2 className="font-semibold text-sm truncate">
                    {fr.displayName}
                  </h2>
                  <span className="text-sm text-muted-foreground">
                    @{fr.username}
                  </span>
                </div>
              </div>
            </Card>
          ))}
          {friends.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">
              Không có bạn bè nào để hiển thị.
            </p>
          )}
        </div>
      </div>
      <DialogClose ref={closeButtonRef} className="hidden" />
    </DialogContent>
  );
};

export default FriendListModal;
