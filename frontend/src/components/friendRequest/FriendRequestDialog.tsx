import { useFriendStore } from "@/store/useFriendStore";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import SentRequests from "./SentRequests";
import ReceivedRequests from "./ReceivedRequests";

interface FriendReqeustDialogProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const FriendRequestDialog = ({ open, setOpen }: FriendReqeustDialogProps) => {
  const [tab, setTab] = useState("received");
  const { getAllFriendRequest } = useFriendStore();

  useEffect(() => {
    const loadRequest = async () => {
      try {
        await getAllFriendRequest();
      } catch (error) {
        console.error("loi xay ra khi load request cho UI", error);
      }
    };
    loadRequest();
  }, []);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Friend Requests</DialogTitle>
        </DialogHeader>
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="received">Đã nhận</TabsTrigger>
            <TabsTrigger value="sent">Đã gửi</TabsTrigger>
          </TabsList>
          <TabsContent value="received">
            <ReceivedRequests />
          </TabsContent>
          <TabsContent value="sent">
            <SentRequests />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default FriendRequestDialog;
