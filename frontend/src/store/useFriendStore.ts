import { friendService } from "@/services/friendService";
import type { FriendState } from "@/types/store";
import { create } from "zustand";

export const useFriendStore = create<FriendState>((set) => ({
  friends: [],
  loading: false,
  receivedList: [],
  sentList: [],
  searchByUsername: async (username) => {
    try {
      set({ loading: true });
      const user = await friendService.searchByUsername(username);
      return user;
    } catch (error) {
      console.log("useFriendStore: loi khi tim user bang username", error);
      return null;
    } finally {
      set({ loading: false });
    }
  },
  searchByDisplayName: async (keyword) => {
    try {
      set({ loading: true });
      const user = await friendService.searchByDisplayName(keyword);
      return user;
    } catch (error) {
      console.log("useFriendStore: loi khi tim user bang displayName", error);
      return null;
    } finally {
      set({ loading: false });
    }
  },
  addFriend: async (to, message) => {
    try {
      console.log("useFriendStore.addFriend called with:", { to, message });
      set({ loading: true });
      const resultMessage = await friendService.sendFriendRequest(to, message);
      console.log("useFriendStore.addFriend result:", resultMessage);
      return resultMessage;
    } catch (error) {
      console.log("useFriendStore: loi khi them ban be", error);
      return "loi khi them ban be hay thu lai";
    } finally {
      set({ loading: false });
    }
  },

  getAllFriendRequest: async () => {
    try {
      set({ loading: true });

      const result = await friendService.getAllFriendRequest();

      if (!result) {
        return;
      }

      const { received, sent } = result;

      set({ receivedList: received, sentList: sent });
    } catch (error) {
      console.error(
        "useFriendStore: loi khi lay danh sach yeu cau ket ban",
        error,
      );
    } finally {
      set({ loading: false });
    }
  },

  acceptFriendRequest: async (requestId: string) => {
    try {
      set({ loading: true });
      await friendService.acceptFriendRequest(requestId);

      //neu be tra ve ok (yeu cau duoc chap nhan)
      // thi cap nhat lai store de xoa yeu cau da chap nhan
      set((state) => ({
        //dung filter de loai bo yeu cau co id trung voi requestId
        receivedList: state.receivedList.filter((req) => req._id !== requestId),
      }));
    } catch (error) {
      console.error("useFriendStore: loi khi chap nhan yeu cau ket ban", error);
    } finally {
      set({ loading: false });
    }
  },

  declineFriendRequest: async (requestId: string) => {
    try {
      set({ loading: true });
      await friendService.declineFriendRequest(requestId);

      set((state) => ({
        receivedList: state.receivedList.filter((req) => req._id !== requestId),
      }));
    } catch (error) {
      console.error("useFriendStore: loi khi tu choi yeu cau ket ban", error);
    } finally {
      set({ loading: false });
    }
  },

  getFriends: async () => {
    try {
      set({ loading: true });
      const friends = await friendService.getFriendsList();
      set({ friends: friends });
    } catch (error) {
      console.error("useFriendStore: loi khi lay danh sach ban be", error);
      set({ friends: [] });
    } finally {
      set({ loading: false });
    }
  },
}));
