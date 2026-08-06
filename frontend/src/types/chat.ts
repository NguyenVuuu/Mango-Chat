export interface Participant {
  _id: string;
  displayName: string;
  avatarUrl?: string | null;
  joinedAt: string;
}

export interface SeenUser {
  _id: string;
  displayName?: string;
  avatarUrl?: string | null;
}

export interface Group {
  name: string;
  createdBy: string;
}

export interface LastMessage {
  _id: string;
  content: string;
  createdAt: string;
  sender: {
    _id: string;
    displayName: string;
    avatarUrl?: string | null;
  };
  isRecalled?: boolean;
}

export interface Conversation {
  _id: string;
  type: "direct" | "group";
  group: Group;
  participants: Participant[];
  lastMessageAt: string;
  seenBy: SeenUser[];
  lastMessage: LastMessage | null;
  unreadCounts: Record<string, number>;
  pinnedMessages?: PinnedMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ConversationResponse {
  conversations: Conversation[];
}

export interface Reaction {
  emoji: string;
  userId: string;
  createdAt?: string;
}

export interface PinnedMessage {
  messageId: string;
  pinnedBy: {
    _id: string;
    displayName: string;
    avatarUrl?: string | null;
  };
  pinnedAt: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId:
    | string
    | {
        _id?: string | null;
        displayName?: string;
        avatarUrl?: string | null;
      };
  content: string | null;
  imgUrl?: string | null;
  updatedAt?: string | null;
  createdAt: string;
  senderName?: string;
  reactions?: Reaction[];
  replyTo?: {
    _id: string;
    content: string | null;
    senderName: string;
  };
  isRecalled?: boolean;
  recalledAt?: string | null;
  messageType?: "user" | "system";
  systemMessageType?: "pin" | "unpin";
}
