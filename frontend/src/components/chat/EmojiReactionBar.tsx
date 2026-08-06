import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useThemeStore } from "@/store/useThemeStore";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

interface EmojiReactionBarProps {
  onEmojiSelect: (emoji: string) => void;
  isLoading?: boolean;
}

// Quick emoji reactions
const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "😭", "🔥"];

const EmojiReactionBar = ({
  onEmojiSelect,
  isLoading = false,
}: EmojiReactionBarProps) => {
  const { isDark } = useThemeStore();
  const [showFullPicker, setShowFullPicker] = useState(false);

  const handleEmojiSelect = (emoji: string) => {
    onEmojiSelect(emoji);
    setShowFullPicker(false);
  };

  const handlePickerEmojiSelect = (emoji: unknown) => {
    if (typeof emoji === "object" && emoji !== null && "native" in emoji) {
      handleEmojiSelect((emoji as { native: string }).native);
    }
  };

  return (
    <div className="flex items-center gap-1 bg-white dark:bg-slate-800 rounded-full px-2 py-1 shadow-md border border-gray-200 dark:border-slate-700">
      {QUICK_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => handleEmojiSelect(emoji)}
          disabled={isLoading}
          className="text-lg hover:scale-125 transition-transform cursor-pointer disabled:opacity-50"
          title={emoji}
        >
          {emoji}
        </button>
      ))}

      {/* More emojis button */}
      <Popover open={showFullPicker} onOpenChange={setShowFullPicker}>
        <PopoverTrigger asChild>
          <button
            disabled={isLoading}
            className="text-lg hover:scale-125 transition-transform cursor-pointer disabled:opacity-50 ml-1"
            title="Thêm emoji khác"
          >
            ➕
          </button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          sideOffset={10}
          className="bg-transparent border-none shadow-none drop-shadow-none p-0"
        >
          <Picker
            theme={isDark ? "dark" : "light"}
            data={data}
            onEmojiSelect={handlePickerEmojiSelect}
            emojiSize={24}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default EmojiReactionBar;
