import { useChatStore } from "@/store/useChatStore";
import ChatWelcomeScreen from "./ChatWelcomeScreen";
import MessageItem from "./MessageItem";
import PinnedMessagesBar from "./PinnedMessagesBar";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import type { Message } from "@/types/chat";
import { toast } from "sonner";

const ChatWindowBody = () => {
  const {
    activeConversationId,
    conversations,
    messages: allMessages,
    fetchMessages,
    pinMessage,
    unpinMessage,
  } = useChatStore();

  const [lastMessageStatus, setLastMessageStatus] = useState<
    "đã gửi" | "đã xem"
  >("đã gửi");

  const messages = allMessages[activeConversationId!]?.items ?? [];

  //tao ban copy cua messages de dao nguoc vi tri bang reverse() ma khong anh huong den mang goc
  const reversedMessages = [...messages].reverse();
  const hasMore = allMessages[activeConversationId!]?.hasMore ?? false;

  const selectedConver = conversations.find(
    (c) => c._id === activeConversationId
  );

  const key = `chat-scroll-${activeConversationId}`;
  useEffect(() => {
    const lastMessage = selectedConver?.lastMessage;
    if (!lastMessage) {
      return;
    }
    const seenBy = selectedConver?.seenBy ?? [];
    setLastMessageStatus(seenBy.length > 0 ? "đã xem" : "đã gửi");
  }, [selectedConver]);

  //ref de scroll den cuoi khi comp render
  const messagesEndRef = useRef<HTMLDivElement>(null);
  //ref de luu vi tri scroll cuoi cung
  const containerRef = useRef<HTMLDivElement>(null);

  //scroll den cuoi khi load cuoc tro chuyen
  useLayoutEffect(() => {
    if (!activeConversationId) {
      return;
    }
    if (!messagesEndRef.current) {
      return;
    }
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    });
  }, [activeConversationId]);

  const fetchMoreMessages = async () => {
    if (!activeConversationId) {
      return;
    }
    try {
      await fetchMessages(activeConversationId);
    } catch (error) {
      console.error("loi khi fetch more messages", error);
    }
  };

  const handleReply = (message: Message) => {
    useChatStore.setState({ replyingTo: message });
  };

  const handlePin = async (message: Message) => {
    try {
      await pinMessage(message._id);
      toast.success("Ghim tin nhắn thành công");
    } catch (error) {
      console.error("Lỗi khi ghim tin nhắn:", error);
      toast.error("Ghim tin nhắn thất bại");
    }
  };

  const handleUnpin = async (messageId: string) => {
    try {
      await unpinMessage(messageId);
      toast.success("Bỏ ghim tin nhắn thành công");
    } catch (error) {
      console.error("Lỗi khi bỏ ghim tin nhắn:", error);
      toast.error("Bỏ ghim tin nhắn thất bại");
    }
  };

  const handleNavigateToPinned = (messageId: string) => {
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: "smooth", block: "center" });
      messageElement.classList.add("highlight-message");
      setTimeout(() => {
        messageElement.classList.remove("highlight-message");
      }, 2000);
    }
  };

  const handleDelete = (messageId: string) => {
    // TODO: Implement delete functionality
    console.log("Delete message:", messageId);
    toast.info("Xóa tin nhắn");
  };

  const handleScrollSave = () => {
    const container = containerRef.current;
    if (!container || !activeConversationId) {
      return;
    }

    sessionStorage.setItem(
      key,
      JSON.stringify({
        scrollTop: container.scrollTop,
        scrollHeight: container.scrollHeight,
      })
    );
  };

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const item = sessionStorage.getItem(key);

    if (item) {
      const { scrollTop } = JSON.parse(item);
      requestAnimationFrame(() => {
        container.scrollTop = scrollTop;
      });
    }
  }, [messages.length]);

  if (!selectedConver) {
    return <ChatWelcomeScreen />;
  }

  if (!messages?.length) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <p className="text-muted-foreground">No messages</p>
      </div>
    );
  }
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Pinned Messages Bar */}
      <PinnedMessagesBar
        pinnedMessages={selectedConver.pinnedMessages || []}
        onUnpin={handleUnpin}
        onNavigate={handleNavigateToPinned}
      />

      {/* Messages Container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div
          id="scrollableDiv"
          ref={containerRef}
          onScroll={handleScrollSave}
          className="flex flex-col-reverse overflow-y-auto overflow-x-hidden px-4 py-2 chat-scrollbar"
        >
          <div ref={messagesEndRef}></div>

          <InfiniteScroll
            dataLength={messages.length}
            next={fetchMoreMessages}
            hasMore={hasMore}
            scrollableTarget="scrollableDiv"
            loader={
              <div className="flex justify-center py-2">
                <p className="text-sm text-muted-foreground">Đang tải...</p>
              </div>
            }
            inverse={true}
            style={{
              display: "flex",
              flexDirection: "column-reverse",
              overflow: "visible",
            }}
          >
            {reversedMessages.map((msg, index) => (
              <div key={msg._id ?? index} id={`message-${msg._id}`}>
                <MessageItem
                  message={msg}
                  index={index}
                  messages={reversedMessages}
                  selectedConver={selectedConver}
                  lastMessageStatus={lastMessageStatus}
                  onReply={handleReply}
                  onPin={handlePin}
                  onUnpin={handleUnpin}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </InfiniteScroll>
        </div>
      </div>
    </div>
  );
};

export default ChatWindowBody;
