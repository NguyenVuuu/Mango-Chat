// import { Reaction } from "@/types/chat";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import type { Reaction } from "@/types/chat";

interface ReactionDisplayProps {
  reactions?: Reaction[];
  onReactionClick?: (emoji: string) => void;
}

const ReactionDisplay = ({
  reactions = [],
  onReactionClick,
}: ReactionDisplayProps) => {
  const { user } = useAuthStore();

  if (!reactions || reactions.length === 0) {
    return null;
  }

  // Get unique emojis
  const uniqueEmojis = Array.from(new Set(reactions.map((r) => r.emoji)));

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {uniqueEmojis.map((emoji) => {
        const isUserReacted = reactions.some(
          (r) => r.emoji === emoji && r.userId === user?._id
        );
        return (
          <button
            key={emoji}
            onClick={() => onReactionClick?.(emoji)}
            className={cn(
              "text-xl transition-transform hover:scale-125 cursor-pointer",
              isUserReacted ? "scale-110" : ""
            )}
            title={`Click để ${isUserReacted ? "xóa" : "thêm"} reaction`}
          >
            {emoji}
          </button>
        );
      })}
    </div>
  );
};

export default ReactionDisplay;
