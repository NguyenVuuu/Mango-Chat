import { chatService } from "@/services/chatService";
import { getSenderId } from "@/lib/message";
import type { ChatState } from "@/types/store";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "./useAuthStore";
import { useSocketStore } from "./useSocketStore";

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      messages: {},
      activeConversationId: null,
      replyingTo: null,
      converLoading: false, //converloading
      messageLoading: false,
      loading: false,
      setActiveConversation: (id) =>
        set({
          activeConversationId: id,
        }),
      setReplyingTo: (message) =>
        set({
          replyingTo: message,
        }),
      reset: () => {
        set({
          conversations: [],
          messages: {},
          activeConversationId: null,
          replyingTo: null,
          converLoading: false,
          messageLoading: false,
        });
      },
      fetchConversations: async () => {
        try {
          set({ converLoading: true });
          const { conversations } = await chatService.fetchConversations();

          set({ conversations, converLoading: false });
        } catch (error) {
          console.error(
            "useChatStore: loi xay ra khi fetchConversations: ",
            error,
          );
          set({ converLoading: false });
        }
      },
      fetchMessages: async (conversationId) => {
        const { activeConversationId, messages } = get();
        const converId = conversationId ?? activeConversationId;

        if (!converId) {
          return;
        }
        const current = messages?.[converId];
        const nextCursor =
          current?.nextCursor === undefined ? "" : current?.nextCursor;

        if (nextCursor === null) {
          return;
        }
        set({ messageLoading: true });
        //call api de lay message moi

        try {
          const { messages: fetched, cursor } = await chatService.fetchMessages(
            converId,
            nextCursor,
          );

          //luu mang tin nhan sau khi xu ly
          const normalizedFetched = fetched.map((message) => ({
            ...message,
            senderId: getSenderId(message.senderId),
          }));

          set((state) => {
            //lay danh sach tin nhan cu
            const prev = state.messages[converId]?.items ?? [];
            //merge tin nhan cu va tin nhan moi
            const merged =
              prev.length > 0
                ? [...normalizedFetched, ...prev]
                : normalizedFetched;

            return {
              messages: {
                ...state.messages,
                [converId]: {
                  items: merged,
                  hasMore: !!cursor,
                  nextCursor: cursor ?? null,
                },
              },
            };
          });
        } catch (error) {
          console.error("useChatStore: loi xay ra khi fetchMsg: ", error);
        } finally {
          set({ messageLoading: false });
        }
      },
      sendDirectMessage: async (
        recipientId,
        content,
        imgUrl,
        replyToId,
        replyToContent,
        replyToSenderName,
      ) => {
        try {
          const { activeConversationId } = get();
          await chatService.sendDirectMessage(
            recipientId,
            content,
            imgUrl,
            activeConversationId || undefined,
            replyToId,
            replyToContent,
            replyToSenderName,
          );
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c._id === activeConversationId ? { ...c, seenBy: [] } : c,
            ),
          }));
        } catch (error) {
          console.error("useChatStore: loi xay ra khi gui direct msg:", error);
        }
      },
      sendGroupMessage: async (
        conversationId,
        content,
        imgUrl,
        replyToId,
        replyToContent,
        replyToSenderName,
      ) => {
        try {
          await chatService.sendGroupMessage(
            conversationId,
            content,
            imgUrl,
            replyToId,
            replyToContent,
            replyToSenderName,
          );
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c._id === get().activeConversationId ? { ...c, seenBy: [] } : c,
            ),
          }));
        } catch (error) {
          console.error("useChatStore: loi xay ra khi gui group msg:", error);
        }
      },
      addMessage: async (message) => {
        try {
          const { fetchMessages } = get();
          const normalizedMessage = {
            ...message,
            senderId: getSenderId(message.senderId),
          };
          const converId = normalizedMessage.conversationId;

          //lay danh sach tin nhan hien co trong store trong cuoc hoi thoai
          /*
          neu truoc do tung mo conversation nay thi prevItems chua cac tin nhan cu
          neu chua mo thi prevItems = []
          */
          let prevItems = get().messages[converId]?.items ?? [];

          if (prevItems.length === 0) {
            await fetchMessages(normalizedMessage.conversationId);
            prevItems = get().messages[converId]?.items ?? [];
          }

          set((state) => {
            if (prevItems.some((m) => m._id === message._id)) {
              return state;
            }
            return {
              messages: {
                ...state.messages,
                [converId]: {
                  items: [...prevItems, normalizedMessage],
                  hasMore: state.messages[converId]?.hasMore,
                  nextCursor: state.messages[converId]?.nextCursor ?? undefined,
                },
              },
            };
          });
        } catch (error) {
          console.error("useChatStore: loi xay ra khi add msg:", error);
        }
      },
      updateConversation: (conversation) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c._id === conversation._id ? { ...c, ...conversation } : c,
          ),
        }));
      },
      markAsSeen: async () => {
        try {
          const { user } = useAuthStore.getState();
          const { activeConversationId, conversations } = get();
          if (!activeConversationId || !user) {
            return;
          }
          //tim cuoc hoi thoai hien tai
          const conver = conversations.find(
            (c) => c._id === activeConversationId,
          );

          if (!conver) {
            return;
          }

          //neu so luong tin nhan chua doc cua user bang 0 thi khong can goi api
          if ((conver.unreadCounts?.[user._id] ?? 0) === 0) {
            return;
          }
          await chatService.markAsSeen(activeConversationId);
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c._id === activeConversationId && c.lastMessage
                ? {
                    ...c,
                    unreadCounts: {
                      ...c.unreadCounts,
                      [user._id]: 0,
                    },
                  }
                : c,
            ),
          }));
        } catch (error) {
          console.error("useChatStore: loi xay ra khi mark as seen:", error);
        }
      },

      addConversation(conversation) {
        set((state) => {
          const exists = state.conversations.some(
            (c) => c._id.toString() === conversation._id.toString(),
          );
          return {
            conversations: exists
              ? state.conversations
              : [conversation, ...state.conversations],
            activeConversationId: conversation._id,
          };
        });
      },

      createConversation: async (type, name, memberIds) => {
        try {
          set({ loading: true });
          const conversation = await chatService.createConversation(
            type,
            name,
            memberIds,
          );

          get().addConversation(conversation);

          useSocketStore
            .getState()
            .socket?.emit("join-conversation", conversation._id);
        } catch (error) {
          console.error(
            "useChatStore: loi xay ra khi tao conversation:",
            error,
          );
        } finally {
          set({ loading: false });
        }
      },

      updateMessageReactions: (messageId, reactions) => {
        set((state) => {
          const updatedMessages = { ...state.messages };

          // Tim conversation chua message nay
          for (const converId in updatedMessages) {
            const items = updatedMessages[converId]?.items ?? [];
            const messageIndex = items.findIndex((m) => m._id === messageId);

            if (messageIndex !== -1) {
              items[messageIndex] = {
                ...items[messageIndex],
                reactions,
              };
              updatedMessages[converId] = {
                ...updatedMessages[converId],
                items,
              };
              break;
            }
          }

          return { messages: updatedMessages };
        });
      },

      deleteMessage: (messageId: string) => {
        set((state) => {
          const { activeConversationId } = state;
          if (!activeConversationId) return state;

          const updatedMessages = { ...state.messages };
          const items = updatedMessages[activeConversationId]?.items ?? [];

          // Xóa tin nhắn khỏi danh sách
          updatedMessages[activeConversationId] = {
            ...updatedMessages[activeConversationId],
            items: items.filter((m) => m._id !== messageId),
          };

          return { messages: updatedMessages };
        });
      },

      updateMessageRecalled: (
        messageId: string,
        isRecalled: boolean,
        recalledAt: string,
      ) => {
        set((state) => {
          const updatedMessages = { ...state.messages };
          let conversationIdWithRecalledMessage: string | null = null;

          // Tim conversation chua message nay
          for (const converId in updatedMessages) {
            const items = updatedMessages[converId]?.items ?? [];
            const messageIndex = items.findIndex((m) => m._id === messageId);

            if (messageIndex !== -1) {
              items[messageIndex] = {
                ...items[messageIndex],
                isRecalled,
                recalledAt,
              };
              updatedMessages[converId] = {
                ...updatedMessages[converId],
                items,
              };
              conversationIdWithRecalledMessage = converId;
              break;
            }
          }

          // Cap nhat lastMessage neu tin nhan da thu hoi la lastMessage
          let updatedConversations = state.conversations;
          if (conversationIdWithRecalledMessage) {
            updatedConversations = state.conversations.map((c) => {
              if (
                c._id === conversationIdWithRecalledMessage &&
                c.lastMessage?._id === messageId
              ) {
                return {
                  ...c,
                  lastMessage: c.lastMessage
                    ? {
                        ...c.lastMessage,
                        isRecalled: true,
                      }
                    : null,
                };
              }
              return c;
            });
          }

          return {
            messages: updatedMessages,
            conversations: updatedConversations,
          };
        });
      },

      pinMessage: async (messageId: string) => {
        try {
          const { activeConversationId } = get();
          if (!activeConversationId) return;

          await chatService.pinMessage(activeConversationId, messageId);
        } catch (error) {
          console.error("useChatStore: loi xay ra khi pin message:", error);
        }
      },

      unpinMessage: async (messageId: string) => {
        try {
          const { activeConversationId } = get();
          if (!activeConversationId) return;

          await chatService.unpinMessage(activeConversationId, messageId);
        } catch (error) {
          console.error("useChatStore: loi xay ra khi unpin message:", error);
        }
      },

      updatePinnedMessages: (conversationId: string, pinnedMessages: any[]) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c._id === conversationId ? { ...c, pinnedMessages } : c,
          ),
        }));
      },
    }),
    {
      name: "chat-storage",

      partialize: (state) => ({
        conversations: state.conversations,
      }),
    },
  ),
);
