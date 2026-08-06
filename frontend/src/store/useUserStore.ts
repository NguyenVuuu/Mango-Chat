import { userService } from "@/services/userService";
import type { UserState } from "@/types/store";
import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import { toast } from "sonner";
import { useChatStore } from "./useChatStore";

export const useUserStore = create<UserState>(() => ({
  updateAvatarUrl: async (formData) => {
    try {
      const { user, setUser } = useAuthStore.getState();
      const data = await userService.uploadAvatar(formData);

      if (user) {
        setUser({
          ...user,
          avatarUrl: data.avatarUrl,
        });
        useChatStore.getState().fetchConversations();
      }
    } catch (error) {
      console.error("Failed to upload avatar url:", error);
      toast.error("Upload avtar khong thanh cong. Vui long thu lai!");
    }
  },

  updateProfile: async (profileData) => {
    try {
      const { setUser } = useAuthStore.getState();
      const updatedUser = await userService.updateProfile(profileData);

      setUser(updatedUser);
      toast.success("Cập nhật thông tin thành công!");
      return updatedUser;
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Cập nhật thông tin không thành công. Vui lòng thử lại!");
      throw error;
    }
  },
}));
