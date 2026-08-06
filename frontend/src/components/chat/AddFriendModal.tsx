import { useFriendStore } from "@/store/useFriendStore";
import type { User } from "@/types/user";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { UserPlus } from "lucide-react";
import SearchForm from "../AddFriendModal/SearchForm";
import SendFriendRequestForm from "../AddFriendModal/SendFriendRequestForm";

export interface IFormValues {
  keyword: string;
  message: string;
}

const AddFriendModal = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const { loading, searchByDisplayName, addFriend } = useFriendStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<IFormValues>({
    defaultValues: { keyword: "", message: "" },
  });

  //ham watch theo doi input lay gia tri realtime ma khong can bam submit
  const keywordValue = watch("keyword");

  const handleCancel = () => {
    reset();
    setSearchResults([]);
    setSelectedUser(null);
  };

  const handleSearch = async (keyword: string) => {
    if (!keyword.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await searchByDisplayName(keyword);
      if (results && Array.isArray(results)) {
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    }
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setSearchResults([]);
  };

  const handleSend = handleSubmit(async (data) => {
    if (!selectedUser?._id) {
      return;
    }

    try {
      const message = await addFriend(selectedUser._id, data.message.trim());
      toast.success(message);
      handleCancel();
    } catch (error) {
      console.log("Error in handleSend:", error);
    }
  });
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex justify-center items-center size-5 rounded-full hover:bg-sidebar-accent cursor-pointer z-10">
          <UserPlus className="size-4" />
          <span className="sr-only">Kết bạn</span>
        </div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px] border-none">
        <DialogHeader>
          <DialogTitle>Kết bạn</DialogTitle>
        </DialogHeader>
        {!selectedUser && (
          <>
            <SearchForm
              register={register}
              errors={errors}
              keywordValue={keywordValue}
              loading={loading}
              onCancel={handleCancel}
              searchResults={searchResults}
              onSearch={handleSearch}
              onSelectUser={handleSelectUser}
            />
          </>
        )}

        {selectedUser && (
          <>
            <SendFriendRequestForm
              register={register}
              loading={loading}
              selectedUser={selectedUser}
              onSubmit={handleSend}
              onBack={() => setSelectedUser(null)}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddFriendModal;
