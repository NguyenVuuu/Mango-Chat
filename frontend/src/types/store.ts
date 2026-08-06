import type { Conversation, Message } from "./chat";
import type { Friend, FriendRequest, User } from "./user";
import { Socket } from "socket.io-client";

export interface AuthState {
  accessToken: string | null;
  user: User | null;
  loading: boolean;

  setAccessToken: (accessToken: string) => void;
  setUser: (user: User) => void;
  clearState: () => void;

  signUp: (
    username: string,
    password: string,
    email: string,
    firstName: string,
    lastName: string
  ) => Promise<void>;

  signIn: (username: string, password: string) => Promise<void>;

  signOut: () => Promise<void>;

  fetchMe: () => Promise<void>;
  refresh: () => Promise<void>;
}

export interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (dark: boolean) => void;
}

export interface ChatState {
  conversations: Conversation[];
  messages: Record<
    string,
    {
      items: Message[];
      hasMore: boolean;
      nextCursor?: string | null;
    }
  >;
  activeConversationId: string | null; //luu id cua cuoc tro chuyen dang mo khi user click vao
  replyingTo: Message | null; //tin nhan dang duoc tra loi
  converLoading: boolean; //conver loading
  messageLoading: boolean;
  loading: boolean;
  reset: () => void;

  setActiveConversation: (id: string | null) => void;
  setReplyingTo: (message: Message | null) => void;

  fetchConversations: () => Promise<void>;

  fetchMessages: (conversationId?: string) => Promise<void>;

  sendDirectMessage: (
    recipientId: string,
    content: string,
    imgUrl?: string,
    replyToId?: string,
    replyToContent?: string,
    replyToSenderName?: string
  ) => Promise<void>;

  sendGroupMessage: (
    conversationId: string,
    content: string,
    imgUrl?: string,
    replyToId?: string,
    replyToContent?: string,
    replyToSenderName?: string
  ) => Promise<void>;

  // add message
  addMessage: (message: Message) => Promise<void>;

  // update conversation
  //dung cai nay thi bao loi trong useChatStore vi ts khong cho truy cap thuoc tinh (_id, spread ...conversation) trên unknown
  // updateConversation: (conversation: unknown) => void;

  //dung cai nay thi bao loi trong useSocketStore vi updatedConversation khong phai la Conversation day du
  // updateConversation: (conversation: Conversation) => void;

  //dung cai nay thi khong loi vi cho phep nhan conversation update không đầy đủ va bat buoc co _id de tim dung conversation
  updateConversation: (
    conversation: Partial<Conversation> & { _id: string }
  ) => void;

  //mark as seen
  markAsSeen: () => Promise<void>;

  //them cuoc tro chuyen moi trong store
  addConversation: (conversation: Conversation) => void;

  //tao cuoc tro chuyen moi, goi api tu service va cap nhat lai store
  createConversation: (
    type: "group" | "direct",
    name: string,
    memberIds: string[]
  ) => Promise<void>;

  //xoa tin nhan
  deleteMessage: (messageId: string) => void;

  //update message recalled
  updateMessageRecalled: (
    messageId: string,
    isRecalled: boolean,
    recalledAt: string
  ) => void;

  //update message reactions
  updateMessageReactions: (messageId: string, reactions: any) => void;

  //pin message
  pinMessage: (messageId: string) => Promise<void>;

  //unpin message
  unpinMessage: (messageId: string) => Promise<void>;

  //update pinned messages
  updatePinnedMessages: (conversationId: string, pinnedMessages: any[]) => void;
}

export interface SocketState {
  socket: Socket | null;
  onlineUsers: string[];
  connectSocket: () => void;
  disconnectSocket: () => void;
}

export interface FriendState {
  friends: Friend[];
  loading: boolean;
  receivedList: FriendRequest[];
  sentList: FriendRequest[];
  searchByUsername: (username: string) => Promise<User | null>;
  searchByDisplayName: (username: string) => Promise<User | null>;
  addFriend: (to: string, message?: string) => Promise<string>;
  getAllFriendRequest: () => Promise<void>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  declineFriendRequest: (requestId: string) => Promise<void>;
  getFriends: () => Promise<void>;
}

export interface UserState {
  updateAvatarUrl: (formData: FormData) => Promise<void>;
  updateProfile: (profileData: {
    displayName: string;
    bio?: string;
    phone?: string;
    dateOfBirth?: string;
  }) => Promise<User>;
}
