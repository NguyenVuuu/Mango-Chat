import type { User } from "@/types/user";
import { Card, CardContent } from "../ui/card";
import UserAvatar from "../chat/UserAvatar";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import { useSocketStore } from "@/store/useSocketStore";
import AvatarUploader from "./AvatarUploader";
import { Mail, Phone, Calendar, User as UserIcon, Edit2 } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import EditProfileDialog from "./EditProfileDialog";

interface ProfileCardProps {
  user: User | null;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const ProfileCard = ({ user }: ProfileCardProps) => {
  const { onlineUsers } = useSocketStore();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  if (!user) {
    return null;
  }

  if (!user.bio) {
    user.bio = "Chưa có tiểu sứ";
  }
  const isOnline = onlineUsers.includes(user?._id) ? true : false;

  return (
    <div className="space-y-3">
      {/* Main Profile Card */}
      <Card className="overflow-hidden p-0 relative group profile-gradient-bg">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

        <CardContent className="relative flex items-center gap-4 pt-6 pb-4 px-4">
          <div className="relative shrink-0">
            <UserAvatar
              type="profile"
              name={user.displayName}
              avatarUrl={user.avatarUrl ?? undefined}
              className="ring-3 ring-white/30 shadow-xl w-16 h-16 transition-transform duration-200 group-hover:scale-105"
            />
            <AvatarUploader />
          </div>

          {/* User Info */}
          <div className="text-left flex-1 min-w-0">
            <h1 className="text-lg font-bold tracking-tight text-white truncate mb-1">
              {user.displayName}
            </h1>
            {user.bio && user.bio !== "Chưa có tiểu sứ" && (
              <p className="text-white/80 text-sm line-clamp-2 leading-relaxed">
                {user.bio}
              </p>
            )}
          </div>

          {/* Status and Edit Button */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <Badge
              className={cn(
                "flex items-center gap-1.5 capitalize text-xs px-2.5 py-1 font-medium shadow-sm",
                isOnline
                  ? "bg-green-500/20 text-green-100 border-green-400/30 status-badge-online"
                  : "bg-slate-500/20 text-slate-200 border-slate-400/30"
              )}
            >
              <div
                className={cn(
                  "size-2 rounded-full",
                  isOnline
                    ? "bg-green-400 shadow-sm shadow-green-400/50 status-dot-pulse"
                    : "bg-slate-400"
                )}
              />
              {isOnline ? "Trực tuyến" : "Ngoại tuyến"}
            </Badge>

            <Button
              size="sm"
              variant="secondary"
              onClick={() => setEditDialogOpen(true)}
              className="gap-1.5 h-8 text-xs bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30 transition-all duration-200"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Chỉnh sửa
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Information Card */}
      <Card className="bg-card/60 backdrop-blur-md border border-border/50 shadow-lg">
        <CardContent className="pt-4 pb-4 px-4">
          <div className="space-y-3">
            {/* Username */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 profile-info-card">
              <div className="p-2 rounded-full bg-primary/10 profile-icon-container">
                <UserIcon className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">
                  Tên đăng nhập
                </p>
                <p className="text-sm font-semibold text-foreground truncate">
                  {user.username}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 profile-info-card">
              <div className="p-2 rounded-full bg-primary/10 profile-icon-container">
                <Mail className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">
                  Email
                </p>
                <p className="text-sm font-semibold text-foreground break-all">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 profile-info-card">
              <div className="p-2 rounded-full bg-primary/10 profile-icon-container">
                <Phone className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">
                  Số điện thoại
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {user.phone || (
                    <span className="text-muted-foreground italic">
                      Chưa cập nhật
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Date of Birth */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 profile-info-card">
              <div className="p-2 rounded-full bg-primary/10 profile-icon-container">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">
                  Ngày sinh
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {user.dateOfBirth ? (
                    formatDate(user.dateOfBirth)
                  ) : (
                    <span className="text-muted-foreground italic">
                      Chưa cập nhật
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Dialog */}
      <EditProfileDialog
        open={editDialogOpen}
        setOpen={setEditDialogOpen}
        user={user}
      />
    </div>
  );
};

export default ProfileCard;
