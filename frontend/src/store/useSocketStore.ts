import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import type { SocketState } from "@/types/store";
import { io, type Socket } from "socket.io-client";
import { useChatStore } from "./useChatStore";

const baseURL = import.meta.env.VITE_SOCKET_URL || window.location.origin;

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  onlineUsers: [],
  connectSocket: () => {
    const accessToken = useAuthStore.getState().accessToken;
    const existingSocket = get().socket;
    if (existingSocket) {
      return;
    }
    const socket: Socket = io(baseURL, {
      auth: { token: accessToken },
      transports: ["websocket"],
    });
    set({ socket });
    socket.on("connect", () => {
      console.log("da connect socket");
    });

    // online users
    //sau khi connect socket
    //lang nghe event online-users de cap nhat danh sach user online
    socket.on("online-users", (userIds) => {
      //moi lan be gui len danh sach moi thi cap nhat vao mang
      set({ onlineUsers: userIds });
    });

    //new message
    socket.on("new-message", ({ message, conversation, unreadCounts }) => {
      useChatStore.getState().addMessage(message);
      const lastMessage = {
        _id: conversation.lastMessage._id,
        content: conversation.lastMessage.content,
        createdAt: conversation.lastMessage.createdAt,
        sender: {
          _id: conversation.lastMessage.senderId,
          displayName: "",
          avatarUrl: null,
        },
      };

      const updatedConversation = {
        ...conversation,
        lastMessage,
        unreadCounts,
      };

      //neu user dang mo cuoc hoi thoai nay
      if (
        useChatStore.getState().activeConversationId === message.conversationId
      ) {
        // danh dau da doc
        //mark as seen neu user dang mo cuoc hoi thoai nay
        useChatStore.getState().markAsSeen();
      }
      useChatStore.getState().updateConversation(updatedConversation);
    });

    //read message

    socket.on("read-message", ({ conversation, lastMessage }) => {
      const updated = {
        // ...conversation,
        // lastMessage,
        _id: conversation._id,
        lastMessage,
        lastMessageAt: conversation.lastMessageAt,
        unreadCounts: conversation.unreadCounts,
        seenBy: conversation.seenBy,
      };
      useChatStore.getState().updateConversation(updated);
    });

    //new group
    socket.on("new-group", (conversation) => {
      //cap nhat danh sach cuoc hoi thoai phia client
      useChatStore.getState().addConversation(conversation);

      //join room cua cuoc hoi thoai moi tao
      socket.emit("join-conversation", conversation._id);
    });

    // message reaction
    socket.on("message:reaction", ({ messageId, reactions }) => {
      useChatStore.getState().updateMessageReactions(messageId, reactions);
    });

    // message recalled
    socket.on("message:recalled", ({ messageId, isRecalled, recalledAt }) => {
      useChatStore
        .getState()
        .updateMessageRecalled(messageId, isRecalled, recalledAt);
    });

    // message pinned
    socket.on(
      "message-pinned",
      ({ conversationId, pinnedMessages, systemMessage }) => {
        useChatStore
          .getState()
          .updatePinnedMessages(conversationId, pinnedMessages);
        if (systemMessage) {
          useChatStore.getState().addMessage(systemMessage);
        }
      },
    );

    // message unpinned
    socket.on(
      "message-unpinned",
      ({ conversationId, pinnedMessages, systemMessage }) => {
        useChatStore
          .getState()
          .updatePinnedMessages(conversationId, pinnedMessages);
        if (systemMessage) {
          useChatStore.getState().addMessage(systemMessage);
        }
      },
    );
  },
  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },
}));
