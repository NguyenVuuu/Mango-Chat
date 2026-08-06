import type { User } from "@/types/user";
import { Dialog } from "../ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Card, CardContent } from "../ui/card";
import UserAvatar from "../chat/UserAvatar";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import { useSocketStore } from "@/store/useSocketStore";
import {
  Mail,
  Phone,
  Calendar,
  User as UserIcon,
  Users,
  Users2,
  XIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { friendService } from "@/services/friendService";

interface OtherUserProfileDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
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

const OtherUserProfileDialog = ({
  open,
  setOpen,
  user,
}: OtherUserProfileDialogProps) => {
  const { onlineUsers } = useSocketStore();
  const [mutualFriends, setMutualFriends] = useState<User[]>([]);
  const [mutualGroups, setMutualGroups] = useState<any[]>([]);

  useEffect(() => {
    if (open && user?._id) {
      fetchMutualData();
    }
  }, [open, user?._id]);

  const fetchMutualData = async () => {
    try {
      const [friendsRes, groupsRes] = await Promise.all([
        friendService.getMutualFriends(user!._id),
        friendService.getMutualGroups(user!._id),
      ]);
      setMutualFriends(friendsRes.mutualFriends || []);
      setMutualGroups(groupsRes.mutualGroups || []);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu bạn chung và nhóm chung:", error);
    }
  };

  if (!user) {
    return null;
  }

  const isOnline = onlineUsers.includes(user._id) ? true : false;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed top-[50%] left-[50%] z-50 translate-x-[-50%] translate-y-[-50%] outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
            "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
            "duration-300 ease-out",
            "w-full max-w-[400px] sm:max-w-[450px]",
            "max-h-[90vh] sm:max-h-[500px]",
            "mx-4 sm:mx-0"
          )}
        >
          <div className="bg-gradient-glass rounded-xl shadow-2xl border border-white/10 overflow-hidden">
            <div className="relative">
              {/* Close Button */}
              <DialogPrimitive.Close className="absolute top-4 right-4 z-10 rounded-full p-2 bg-black/20 hover:bg-black/40 text-white/70 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20">
                <XIcon className="w-4 h-4" />
                <span className="sr-only">Đóng</span>
              </DialogPrimitive.Close>

              {/* Content */}
              <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-2rem)] sm:max-h-[calc(500px-2rem)] profile-scrollbar">
                {/* Header */}
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-foreground text-center">
                    Thông tin người dùng
                  </h2>
                </div>

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
                          className="ring-3 ring-white/30 shadow-xl w-16 h-16"
                        />
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

                      {/* Status */}
                      <div className="shrink-0">
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

                  {/* Mutual Friends & Groups */}
                  {(mutualFriends.length > 0 || mutualGroups.length > 0) && (
                    <Card className="bg-card/60 backdrop-blur-md border border-border/50 shadow-lg">
                      <CardContent className="pt-4 pb-4 px-4">
                        <div className="space-y-3">
                          {/* Mutual Friends */}
                          {mutualFriends.length > 0 && (
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 profile-info-card">
                              <div className="p-2 rounded-full bg-primary/10 profile-icon-container">
                                <Users className="w-4 h-4 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">
                                  Bạn chung
                                </p>
                                <p className="text-sm font-semibold text-foreground">
                                  {mutualFriends.length} người bạn chung
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Mutual Groups */}
                          {mutualGroups.length > 0 && (
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 profile-info-card">
                              <div className="p-2 rounded-full bg-primary/10 profile-icon-container">
                                <Users2 className="w-4 h-4 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">
                                  Nhóm chung
                                </p>
                                <p className="text-sm font-semibold text-foreground">
                                  {mutualGroups.length} nhóm chung
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </Dialog>
  );
};

export default OtherUserProfileDialog;
