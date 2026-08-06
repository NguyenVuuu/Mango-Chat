import type { Dispatch, SetStateAction } from "react";
import { Dialog } from "../ui/dialog";
import ProfileCard from "./ProfileCard";
import { useAuthStore } from "@/store/useAuthStore";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { XIcon } from "lucide-react";

interface ProfileDialogProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const ProfileDialog = ({ open, setOpen }: ProfileDialogProps) => {
  const { user } = useAuthStore();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed top-[50%] left-[50%] z-50 translate-x-[-50%] translate-y-[-50%] outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
            "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
            "duration-300 ease-out",
            "w-full max-w-[400px] sm:max-w-[450px]",
            "max-h-[90vh] sm:max-h-[500px]",
            "mx-4 sm:mx-0"
          )}
        >
          <div className="bg-gradient-glass rounded-xl shadow-2xl border border-white/10 overflow-hidden">
            <div className="relative">
              {/* Close Button */}
              <DialogPrimitive.Close className="absolute top-4 right-4 z-10 rounded-full p-2 bg-black/20 hover:bg-black/40 text-white/70 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20">
                <XIcon className="w-4 h-4" />
                <span className="sr-only">Đóng</span>
              </DialogPrimitive.Close>

              {/* Content */}
              <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-2rem)] sm:max-h-[calc(500px-2rem)] profile-scrollbar">
                {/* Header */}
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-foreground text-center">
                    Hồ sơ của tôi
                  </h2>
                </div>

                {/* Profile Content */}
                <ProfileCard user={user} />
              </div>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </Dialog>
  );
};

export default ProfileDialog;
