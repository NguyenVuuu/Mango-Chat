import api from "@/lib/axios";

export const authService = {
  signUp: async (
    username: string,
    password: string,
    email: string,
    firstName: string,
    lastName: string
  ) => {
    const res = await api.post(
      "auth/signup",
      { username, password, email, firstName, lastName },
      { withCredentials: true }
    );
    return res.data; // lay du lieu tra ve
  },

  signIn: async (username: string, password: string) => {
    const res = await api.post(
      "auth/signin",
      { username, password },
      { withCredentials: true }
    );
    return res.data.accessToken;
  },

  signOut: async () => {
    const res = await api.post("/auth/signout", {}, { withCredentials: true });
    return res;
  },

  fetchMe: async () => {
    const res = await api.get(
      "/users/me",
      { withCredentials: true } // gui kem cookies sang be
    );
    return res.data; // chi tra thong tin user tu res
    // return res.data.user; // chi tra thong tin user tu res
    //chon 1 trong 2 cai nay de sua khong load user
  },

  refresh: async () => {
    const res = await api.post("/auth/refresh", { withCredentials: true });
    return res.data.accessToken;
  },

  // fetchMe: async () => {
  //   const res = await api.get("/users/me", { withCredentials: true });
  //   return res.data.user;
  // },

  // refresh: async () => {
  //   const res = await api.post("/auth/refresh", { withCredentials: true });
  //   return res.data.accessToken;
  // },
};
