import type { UseFormRegister } from "react-hook-form";
import type { IFormValues } from "../chat/AddFriendModal";
import type { User } from "@/types/user";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { UserPlus, ArrowLeft } from "lucide-react";
import UserAvatar from "../chat/UserAvatar";

interface SendRequestProps {
  register: UseFormRegister<IFormValues>;
  loading: boolean;
  selectedUser: User;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  onBack: () => void;
}

const SendFriendRequestForm = ({
  register,
  loading,
  selectedUser,
  onSubmit,
  onBack,
}: SendRequestProps) => {
  return (
    <form onSubmit={onSubmit}>
      <div className="space-y-4">
        {/* User Profile Card */}
        <div className="border rounded-lg p-4 bg-muted/30">
          <div className="flex items-center gap-4">
            <UserAvatar
              type="chat"
              name={selectedUser.displayName}
              avatarUrl={selectedUser.avatarUrl}
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base truncate">
                {selectedUser.displayName}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                @{selectedUser.username}
              </p>
              {selectedUser.bio && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {selectedUser.bio}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Message Input */}
        <div className="space-y-2">
          <Label htmlFor="message" className="text-sm font-semibold">
            Lời giới thiệu
          </Label>
          <Textarea
            id="message"
            rows={3}
            placeholder="Chào bạn ~ Có thể kết bạn được không?..."
            className="glass border-border/50 focus:border-primary/50 transition-smooth resize-none"
            {...register("message")}
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="flex-1 glass hover:text-destructive"
            onClick={onBack}
          >
            <ArrowLeft className="size-4 mr-2" />
            Quay lại
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-chat text-white hover:opacity-90 transition-smooth"
          >
            {loading ? (
              <span>Đang gửi...</span>
            ) : (
              <>
                <UserPlus className="size-4 mr-2" /> Gửi lời mời
              </>
            )}
          </Button>
        </DialogFooter>
      </div>
    </form>
  );
};

export default SendFriendRequestForm;
