import api from "@/lib/axios";

export const friendService = {
  async searchByUsername(username: string) {
    const res = await api.get(`/users/search?username=${username}`);
    console.log("Search API response:", res.data);
    // Backend trả về { user: {...} }, nên cần lấy res.data.user
    return res.data.user;
  },

  async searchByDisplayName(keyword: string) {
    const res = await api.get(`/users/searchs?keyword=${keyword}`);
    console.log("Search by display name API response:", res.data);
    // Backend trả về { users: [...] }, nên cần lấy res.data.users
    return res.data.users;
  },

  // async sendFriendRequest(to: string, message?: string) {
  //   const res = await api.post(`/friends/requests`, { to, message });

  //   return res.data.message;
  // },
  async sendFriendRequest(to: string, message?: string) {
    console.log("Sending friend request to:", to, "with message:", message);
    const res = await api.post("/friends/requests", { to, message });
    console.log("Friend request response:", res.data);
    return res.data.message;
  },

  async getAllFriendRequest() {
    try {
      const res = await api.get("/friends/requests");
      const { sent, received } = res.data;
      return { sent, received };
    } catch (error) {
      console.error("loi khi gui getAllFriendRequest: ", error);
    }
  },

  async acceptFriendRequest(requestId: string) {
    try {
      const res = await api.post(`/friends/requests/${requestId}/accept`);
      return res.data.requestAcceptedBy;
    } catch (error) {
      console.error("loi khi gui acceptFriendRequest: ", error);
    }
  },

  async declineFriendRequest(requestId: string) {
    try {
      await api.post(`friends/requests/${requestId}/decline`);
    } catch (error) {
      console.error("loi khi gui declineFriendRequest: ", error);
    }
  },

  async getFriendsList() {
    const res = await api.get("/friends");
    return res.data.friends;
  },

  async getMutualFriends(userId: string) {
    const res = await api.get(`/friends/${userId}/mutual-friends`);
    return res.data;
  },

  async getMutualGroups(userId: string) {
    const res = await api.get(`/friends/${userId}/mutual-groups`);
    return res.data;
  },
};
