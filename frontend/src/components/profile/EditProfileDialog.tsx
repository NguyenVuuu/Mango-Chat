import { useState } from "react";
import type { User } from "@/types/user";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { useUserStore } from "@/store/useUserStore";
import {
  Loader2,
  User as UserIcon,
  Phone,
  Calendar,
  FileText,
} from "lucide-react";

interface EditProfileDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  user: User | null;
}

const EditProfileDialog = ({ open, setOpen, user }: EditProfileDialogProps) => {
  const { updateProfile } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: user?.displayName || "",
    bio: user?.bio && user.bio !== "Chưa có tiểu sứ" ? user.bio : "",
    phone: user?.phone || "",
    dateOfBirth: user?.dateOfBirth
      ? new Date(user.dateOfBirth).toISOString().split("T")[0]
      : "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile({
        displayName: formData.displayName,
        bio: formData.bio || undefined,
        phone: formData.phone || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
      });
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-bold text-center">
            Chỉnh sửa thông tin cá nhân
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Display Name */}
          <div className="space-y-2">
            <Label
              htmlFor="displayName"
              className="flex items-center gap-2 text-sm font-medium"
            >
              <UserIcon className="w-4 h-4 text-primary" />
              Tên hiển thị *
            </Label>
            <Input
              id="displayName"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              placeholder="Nhập tên hiển thị"
              className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 profile-form-input"
              required
            />
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <Label
              htmlFor="dateOfBirth"
              className="flex items-center gap-2 text-sm font-medium"
            >
              <Calendar className="w-4 h-4 text-primary" />
              Ngày sinh
            </Label>
            <Input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 profile-form-input"
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label
              htmlFor="phone"
              className="flex items-center gap-2 text-sm font-medium"
            >
              <Phone className="w-4 h-4 text-primary" />
              Số điện thoại
            </Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Nhập số điện thoại"
              className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20 profile-form-input"
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label
              htmlFor="bio"
              className="flex items-center gap-2 text-sm font-medium"
            >
              <FileText className="w-4 h-4 text-primary" />
              Tiểu sử
            </Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Nhập tiểu sử của bạn"
              rows={4}
              maxLength={500}
              className="resize-none transition-all duration-200 focus:ring-2 focus:ring-primary/20 profile-form-input"
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">Tối đa 500 ký tự</p>
              <p
                className={`text-xs font-medium ${
                  formData.bio.length > 450
                    ? "text-orange-500"
                    : formData.bio.length > 480
                      ? "text-red-500"
                      : "text-muted-foreground"
                }`}
              >
                {formData.bio.length}/500
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="flex-1 h-11"
            >
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 h-11 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all duration-200"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;
