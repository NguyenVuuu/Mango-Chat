import { MessageCircle, MessageCircleMore, Users, Heart } from "lucide-react";
import { SidebarInset } from "../ui/sidebar";
import ChatWindowHeader from "./ChatWindowHeader";

const ChatWelcomeScreen = () => {
  return (
    <SidebarInset className="flex flex-col w-full h-full bg-gradient-to-br from-background to-muted/20">
      <ChatWindowHeader />
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="text-center max-w-md mx-auto">
          {/* Main Icon */}
          <div className="flex items-center justify-center size-32 mx-auto mb-8 bg-gradient-chat rounded-full shadow-glow pulse-ring">
            <MessageCircleMore className="size-12 text-white" />
          </div>
          
          {/* Welcome Text */}
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Chào mừng đến với Mango
          </h2>
          <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
            Chọn một cuộc trò chuyện để bắt đầu hoặc tạo cuộc trò chuyện mới
          </p>

          {/* Feature Icons */}
          <div className="flex justify-center gap-8 mb-8">
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-primary/10 rounded-full">
                <MessageCircle className="size-6 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Tin nhắn</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-primary/10 rounded-full">
                <Users className="size-6 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Nhóm chat</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-primary/10 rounded-full">
                <Heart className="size-6 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Kết nối</span>
            </div>
          </div>

          {/* Subtle Animation */}
          <div className="text-xs text-muted-foreground/60">
            Bắt đầu cuộc trò chuyện của bạn...
          </div>
        </div>
      </div>
    </SidebarInset>
  );
};

export default ChatWelcomeScreen;
