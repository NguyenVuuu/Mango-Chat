import { useFriendStore } from "@/store/useFriendStore";
import { User, UserPlus } from "lucide-react";
import { useRef, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import type { Friend } from "@/types/user";
import InviteSuggestionList from "../newGroupChat/InviteSuggestionList";
import SelectedUsersList from "../newGroupChat/SelectedUsersList";
import { toast } from "sonner";
import { useChatStore } from "@/store/useChatStore";

const NewGroupChatModal = () => {
  const [groupName, setGroupName] = useState("");
  const [search, setSearch] = useState("");
  const [invitedUsers, setInvitedUsers] = useState<Friend[]>([]);

  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const { friends, getFriends } = useFriendStore();
  const { loading, createConversation } = useChatStore();

  const filteredFriends = friends.filter(
    (fr) =>
      fr.displayName.toLowerCase().includes(search.toLowerCase()) &&
      //dam bao khong hien nhung nguoi da dc moi
      !invitedUsers.some((u) => u._id === fr._id)
  );

  const handleGetFriends = async () => {
    await getFriends();
  };
  const handleSelectFriend = (friend: Friend) => {
    //rai invited users va them friend vao cuoi danh sach
    setInvitedUsers([...invitedUsers, friend]);
    setSearch("");
  };
  const handleRemove = (friend: Friend) => {
    //filter giu lai nhung nguoi co id khac voi id can xoa
    setInvitedUsers(invitedUsers.filter((u) => u._id !== friend._id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      if (invitedUsers.length === 0) {
        toast.warning("Vui lòng mời ít nhất một người bạn vào nhóm.");
        return;
      }
      await createConversation(
        "group",
        groupName,
        invitedUsers.map((u) => u._id)
      );
      //dong dialog
      closeButtonRef.current?.click();
      //reset form
      setSearch("");
      setInvitedUsers([]);
      setGroupName("");
      toast.success("Nhóm chat đã được tạo thành công!");
    } catch {
      toast.error(
        "Đã có lỗi xảy ra khi tạo nhóm chat trong new group chat modal."
      );
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          onClick={handleGetFriends}
          className="flex z-10 justify-center items-center size-5 rounded-full hover:bg-sidebar-accent transition cursor-pointer"
        >
          <User className="size-4" />
          <span className="sr-only">Tạo nhóm mới</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px] border-none">
        <DialogHeader>
          <DialogTitle className="capitalize">Tạo nhóm mới</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* ten nhom */}
          <div className="space-y-2">
            <Label htmlFor="groupName" className="text-sm font-semibold">
              Tên nhóm
            </Label>
            <Input
              id="groupName"
              placeholder="Nhập tên nhóm"
              className="glass border-border/50 focus:border-primary/50 transition-smooth"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              required
            />
          </div>

          {/* tim kiem ban be */}
          <div className="space-y-2">
            <Label htmlFor="inviteFriends" className="text-sm font-semibold">
              Tìm kiếm bạn bè
            </Label>
            <Input
              id="inviteFriends"
              placeholder="Nhập tên bạn bè"
              className="glass border-border/50 focus:border-primary/50 transition-smooth"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {/* danh sach goi y theo tim kiem */}
            {search && filteredFriends.length > 0 && (
              <InviteSuggestionList
                filteredFriends={filteredFriends}
                onSelect={handleSelectFriend}
              />
            )}
            {/* danh sach ban be da dc them vao nhom */}
            <SelectedUsersList
              invitedUsers={invitedUsers}
              onRemove={handleRemove}
            />
          </div>
          <DialogFooter>
            <Button
              disabled={loading}
              type="submit"
              className="flex-1 bg-gradient-chat text-white hover:opacity-90 transition-smooth"
            >
              {loading ? (
                <span>"Đang tạo..."</span>
              ) : (
                <>
                  <UserPlus className="size-4 mr-2" />
                  Tạo nhóm
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
        <DialogClose ref={closeButtonRef} className="" />
      </DialogContent>
    </Dialog>
  );
};

export default NewGroupChatModal;
