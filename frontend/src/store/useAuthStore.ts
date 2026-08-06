import { create } from "zustand";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import type { AuthState } from "@/types/store";
import { persist } from "zustand/middleware";
import { useChatStore } from "./useChatStore";

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      loading: false,

      setAccessToken(accessToken) {
        set({ accessToken });
      },

      setUser: (user) => {
        set({ user });
      },

      clearState: () => {
        set({ accessToken: null, user: null, loading: false });
        useChatStore.getState().reset();
        localStorage.clear();
        sessionStorage.clear();
      },

      signUp: async (username, password, email, firstName, lastName) => {
        try {
          set({ loading: true });

          //call api sign up
          await authService.signUp(
            username,
            password,
            email,
            firstName,
            lastName
          );

          toast.success("dang ky thanh cong");
        } catch (error) {
          console.error(error);
          toast.error("dang ky khong thanh cong");
        } finally {
          set({ loading: false });
        }
      },

      signIn: async (username, password) => {
        try {
          set({ loading: true });

          get().clearState();
          // localStorage.clear();
          // useChatStore.getState().reset();

          //get accessToken
          const accessToken = await authService.signIn(username, password);
          //cap nhat gia tri cua accessToken
          get().setAccessToken(accessToken);

          //lay thong tin user
          await get().fetchMe();
          useChatStore.getState().fetchConversations();
          toast.success("dang nhap thanh cong");
        } catch (error) {
          console.error(error);
          toast.error("dang nhap khong thanh cong");
        } finally {
          set({ loading: false });
        }
      },

      signOut: async () => {
        try {
          get().clearState();
          //call api sign out
          await authService.signOut();
          toast.success("dang xuat thanh cong");
        } catch (error) {
          console.error(error);
          toast.error("dang xuat khong thanh cong");
        }
      },

      fetchMe: async () => {
        try {
          set({ loading: true });
          //luu ket qua tra ve vao bien user
          const user = await authService.fetchMe();

          // cap nhat user
          set({ user });
        } catch (error) {
          console.log("loi fetchMe trong useAuthStore", error);
          set({ user: null, accessToken: null });
          toast.error("fetchMe khong thanh cong");
        } finally {
          set({ loading: false });
        }
      },
      refresh: async () => {
        try {
          set({ loading: true });
          const { user, fetchMe } = get();
          //tao bien accessToken de luu accessToken
          const accessToken = await authService.refresh();
          //luu accessToken vao store
          get().setAccessToken(accessToken);

          // kiem tra user co null khong
          if (!user) {
            await fetchMe();
          }
        } catch (error) {
          console.error("loi refresh token trong use auth store", error);
          //xoa toan bo thong tin dang nhap
          get().clearState();
          toast.error("refresh token khong thanh cong");
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: "auth-storage",
      //partialize cho phep chon phan nao trong state moi duoc luu
      partialize: (state) => ({
        user: state.user, //chi persist la user
        //nhung state khac nhu accessToken, loading thi khong duoc luu
      }),
    }
  )
);

/*


(set, get) => ({
  accessToken: null,
  user: null,
  loading: false,

  setAccessToken(accessToken) {
    set({ accessToken });
  },

  clearState: () => {
    set({ accessToken: null, user: null, loading: false });
  },

  signUp: async (username, password, email, firstName, lastName) => {
    try {
      set({ loading: true });

      //call api sign up
      await authService.signUp(username, password, email, firstName, lastName);

      toast.success("dang ky thanh cong");
    } catch (error) {
      console.error(error);
      toast.error("dang ky khong thanh cong");
    } finally {
      set({ loading: false });
    }
  },

  signIn: async (username, password) => {
    try {
      set({ loading: true });

      //get accessToken
      const accessToken = await authService.signIn(username, password);
      //cap nhat gia tri cua accessToken
      get().setAccessToken(accessToken);

      //lay thong tin user
      await get().fetchMe();
      toast.success("dang nhap thanh cong");
    } catch (error) {
      console.error(error);
      toast.error("dang nhap khong thanh cong");
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    try {
      get().clearState();
      //call api sign out
      await authService.signOut();
      toast.success("dang xuat thanh cong");
    } catch (error) {
      console.error(error);
      toast.error("dang xuat khong thanh cong");
    }
  },

  fetchMe: async () => {
    try {
      set({ loading: true });
      //luu ket qua tra ve vao bien user
      const user = await authService.fetchMe();

      // cap nhat user
      set({ user });
    } catch (error) {
      console.log("loi fetchMe trong useAuthStore", error);
      set({ user: null, accessToken: null });
      toast.error("fetchMe khong thanh cong");
    } finally {
      set({ loading: false });
    }
  },
  refresh: async () => {
    try {
      set({ loading: true });
      const { user, fetchMe } = get();
      //tao bien accessToken de luu accessToken
      const accessToken = await authService.refresh();
      //luu accessToken vao store
      get().setAccessToken(accessToken);

      // kiem tra user co null khong
      if (!user) {
        await fetchMe();
      }
    } catch (error) {
      console.error("loi refresh token trong use auth store", error);
      //xoa toan bo thong tin dang nhap
      get().clearState();
      toast.error("refresh token khong thanh cong");
    } finally {
      set({ loading: false });
    }
  },
})
*/
