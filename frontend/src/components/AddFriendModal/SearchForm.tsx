import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { IFormValues } from "../chat/AddFriendModal";
import type { User } from "@/types/user";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { DialogClose, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import UserAvatar from "../chat/UserAvatar";

interface SearchFormProps {
  register: UseFormRegister<IFormValues>;
  errors: FieldErrors<IFormValues>;
  loading: boolean;
  keywordValue: string;
  searchResults: User[];
  onCancel: () => void;
  onSearch: (keyword: string) => Promise<void>;
  onSelectUser: (user: User) => void;
}

const SearchForm = ({
  register,
  errors,
  loading,
  keywordValue,
  searchResults,
  onCancel,
  onSearch,
  onSelectUser,
}: SearchFormProps) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onSearch(value);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="keyword" className="text-sm font-semibold">
          Tìm kiếm bạn bè
        </Label>
        <Input
          id="keyword"
          placeholder="Nhập tên bạn bè..."
          className="glass border-border/50 focus:border-primary/50 transition-smooth"
          {...register("keyword")}
          onChange={handleInputChange}
        />
        {errors.keyword && (
          <p className="error-message">{errors.keyword.message}</p>
        )}
      </div>

      {/* Danh sách kết quả tìm kiếm */}
      {keywordValue && searchResults.length > 0 && (
        <div className="border rounded-lg mt-2 max-h-[200px] overflow-y-auto divide-y">
          {searchResults.map((user) => (
            <div
              key={user._id}
              className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted transition"
              onClick={() => onSelectUser(user)}
            >
              <UserAvatar
                type="chat"
                name={user.displayName}
                avatarUrl={user.avatarUrl}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user.displayName}</p>
                <p className="text-xs text-muted-foreground truncate">
                  @{user.username}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {keywordValue && searchResults.length === 0 && !loading && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Không tìm thấy người dùng
        </p>
      )}

      <DialogFooter>
        <DialogClose asChild>
          <Button
            type="button"
            variant="outline"
            className="flex-1 glass hover:text-destructive"
            onClick={onCancel}
          >
            Hủy
          </Button>
        </DialogClose>
      </DialogFooter>
    </div>
  );
};

export default SearchForm;
