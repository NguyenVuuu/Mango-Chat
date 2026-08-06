import { useAuthStore } from "@/store/useAuthStore";
import type { Conversation } from "@/types/chat";
import { useState, useRef } from "react";
import { Button } from "../ui/button";
import { ImagePlus, Send, Loader2 } from "lucide-react";
import { Input } from "../ui/input";
import EmojiPicker from "./EmojiPicker";
import { useChatStore } from "@/store/useChatStore";
import { toast } from "sonner";
import ReplyPreview from "./ReplyPreview";
import { chatService } from "@/services/chatService";
import { getSenderId, isOwnMessage } from "@/lib/message";

const MessageInput = ({ selectedConver }: { selectedConver: Conversation }) => {
  const { user } = useAuthStore();
  const { sendDirectMessage, sendGroupMessage, replyingTo, setReplyingTo } =
    useChatStore();
  const [value, setValue] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn một tệp hình ảnh");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước hình ảnh không được vượt quá 5MB");
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const sendMessage = async () => {
    if (!value.trim() && !selectedImage) {
      return;
    }
    const currentVal = value;
    setValue("");
    try {
      setIsUploadingImage(true);
      let imgUrl: string | undefined;

      // Upload image if selected
      if (selectedImage) {
        const formData = new FormData();
        formData.append("file", selectedImage);
        const uploadResult = await chatService.uploadImage(formData);
        imgUrl = uploadResult.imgUrl;
      }

      // Get sender name for reply
      let replyToSenderName: string | undefined;
      if (replyingTo) {
        if (isOwnMessage(replyingTo.senderId, user?._id)) {
          replyToSenderName = user?.displayName;
        } else {
          // Find sender name from participants
          const sender = selectedConver.participants.find(
            (p) => p._id === getSenderId(replyingTo.senderId)
          );
          replyToSenderName = sender?.displayName;
        }
      }

      if (selectedConver.type === "direct") {
        const participants = selectedConver.participants;
        const otherUser = participants.filter((p) => p._id !== user?._id)[0];
        await sendDirectMessage(
          otherUser._id,
          currentVal,
          imgUrl,
          replyingTo?._id,
          replyingTo?.content || undefined,
          replyToSenderName
        );
      } else {
        await sendGroupMessage(
          selectedConver._id,
          currentVal,
          imgUrl,
          replyingTo?._id,
          replyingTo?.content || undefined,
          replyToSenderName
        );
      }
      // Clear reply and image after sending
      setReplyingTo(null);
      handleRemoveImage();
      toast.success("Tin nhắn đã được gửi");
    } catch (error) {
      console.error(error);
      toast.error("Gửi tin nhắn không thành công, hãy thử lại");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!user) {
    return;
  }

  return (
    <div className="flex flex-col bg-background/95 backdrop-blur-sm">
      {/* Reply Preview */}
      <ReplyPreview
        message={replyingTo}
        selectedConver={selectedConver}
        onClear={() => setReplyingTo(null)}
      />

      {/* Image Preview */}
      {imagePreview && (
        <div className="px-4 pt-3 pb-0">
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="Preview"
              className="max-h-40 rounded-lg border border-border shadow-sm"
            />
            <button
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 bg-destructive text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-destructive/90 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-center gap-3 p-4 min-h-16">
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-primary/10 transition-all duration-200 shrink-0"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploadingImage}
        >
          <ImagePlus className="size-5" />
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleImageSelect}
        />
        
        <div className="flex-1 relative">
          <Input
            onKeyPress={handleKeyPress}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={`Nhập tin nhắn...`}
            className="pr-12 h-10 bg-muted/50 border-border/50 focus:border-primary/50 focus:bg-background transition-all duration-200 resize-none rounded-full"
          />
          <div className="absolute flex items-center gap-1 right-3 top-1/2 transform -translate-y-1/2">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="size-8 hover:bg-primary/10 transition-all duration-200"
            >
              <div>
                <EmojiPicker
                  onChange={(emoji: string) => setValue(`${value}${emoji}`)}
                />
              </div>
            </Button>
          </div>
        </div>
        
        <Button
          onClick={sendMessage}
          className="bg-gradient-chat hover:shadow-glow transition-all duration-200 hover:scale-105 shrink-0 rounded-full size-10 p-0"
          disabled={(!value.trim() && !selectedImage) || isUploadingImage}
        >
          {isUploadingImage ? (
            <Loader2 className="size-4 text-white animate-spin" />
          ) : (
            <Send className="size-4 text-white" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
