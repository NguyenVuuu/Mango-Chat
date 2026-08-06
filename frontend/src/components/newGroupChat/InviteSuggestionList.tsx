import type { Friend } from "@/types/user";
import UserAvatar from "../chat/UserAvatar";

interface InviteSuggestionListProps {
  filteredFriends: Friend[];
  onSelect: (friend: Friend) => void;
}

const InviteSuggestionList = ({
  filteredFriends,
  onSelect,
}: InviteSuggestionListProps) => {
  if (filteredFriends.length === 0) {
    return;
  }
  return (
    <div className="border rounded-lg mt-2 max-h[180px] overflow-y-auto divide-y">
      {filteredFriends.map((ff) => (
        <div
          key={ff._id}
          className="flex items-center gap-3 p-2 cursor-pointer hover:bg-muted transition"
          onClick={() => onSelect(ff)}
        >
          <UserAvatar
            type="chat"
            name={ff.displayName}
            avatarUrl={ff.avatarUrl}
          />
          <span className="font-medium">{ff.displayName}</span>
        </div>
      ))}
    </div>
  );
};

export default InviteSuggestionList;
