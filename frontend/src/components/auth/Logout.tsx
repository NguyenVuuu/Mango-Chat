import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

const Logout = () => {
  const { signOut } = useAuthStore();
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/signin");
    } catch (error) {
      console.log("loi sau khi click btn sign out", error);
    }
  };
  return (
    <div>
      <Button className="" variant="completeGhost" onClick={handleLogout}>
        <LogOut className="text-destructive" />
        Logout
      </Button>
    </div>
  );
};

export default Logout;
