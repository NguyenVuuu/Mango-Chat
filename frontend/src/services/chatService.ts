import api from "@/lib/axios";
import type { ConversationResponse, Message } from "@/types/chat";

interface FetchMessageProps {
  messages: Message[];
  cursor?: string;
}

const pageLimit = 20;
export const chatService = {
  async fetchConversations(): Promise<ConversationResponse> {
    const res = await api.get("/conversations");
    return res.data;
  },
  async fetchMessages(id: string, cursor?: string): Promise<FetchMessageProps> {
    const res = await api.get(
      `/conversations/${id}/messages?limit=${pageLimit}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`
    );
    return { messages: res.data.messages, cursor: res.data.nextCursor };
  },
  async sendDirectMessage(
    recipientId: string,
    content: string = "",
    imgUrl?: string,
    conversationId?: string,
    replyToId?: string,
    replyToContent?: string,
    replyToSenderName?: string
  ) {
    const res = await api.post("/messages/direct", {
      recipientId,
      content,
      imgUrl,
      conversationId,
      replyToId,
      replyToContent,
      replyToSenderName,
    });

    return res.data.message;
  },
  async sendGroupMessage(
    conversationId: string,
    content: string = "",
    imgUrl?: string,
    replyToId?: string,
    replyToContent?: string,
    replyToSenderName?: string
  ) {
    const res = await api.post("/messages/group", {
      conversationId,
      content,
      imgUrl,
      replyToId,
      replyToContent,
      replyToSenderName,
    });
    return res.data.message;
  },
  async markAsSeen(conversationId: string) {
    const res = await api.patch(`/conversations/${conversationId}/seen`);
    return res.data;
  },

  async createConversation(
    type: "direct" | "group",
    name: string,
    memberIds: string[]
  ) {
    const res = await api.post("/conversations", { type, name, memberIds });
    return res.data.conversation;
  },

  async addReaction(messageId: string, emoji: string) {
    const res = await api.post(`/messages/${messageId}/reaction`, {
      emoji,
    });
    return res.data.message;
  },

  async deleteMessage(messageId: string) {
    const res = await api.delete(`/messages/${messageId}`);
    return res.data;
  },

  async recallMessage(messageId: string) {
    const res = await api.post(`/messages/${messageId}/recall`);
    return res.data;
  },

  async uploadImage(formData: FormData) {
    const res = await api.post("/messages/upload-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  async pinMessage(conversationId: string, messageId: string) {
    const res = await api.post("/pinned-messages/pin", {
      conversationId,
      messageId,
    });
    return res.data;
  },

  async unpinMessage(conversationId: string, messageId: string) {
    const res = await api.post("/pinned-messages/unpin", {
      conversationId,
      messageId,
    });
    return res.data;
  },

  async getPinnedMessages(conversationId: string) {
    const res = await api.get(`/pinned-messages/${conversationId}`);
    return res.data;
  },
};
