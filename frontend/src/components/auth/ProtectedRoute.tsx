import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const { accessToken, user, loading, refresh, fetchMe } = useAuthStore();
  const [starting, setStarting] = useState(true);

  //chay sau khi comp render de kiem tra co accessToken chua
  const init = async () => {
    if (!accessToken) {
      await refresh();
    }
    if (accessToken && !user) {
      await fetchMe();
    }
    setStarting(false);
  };

  useEffect(() => {
    init();
  }, []);

  if (starting || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }
  if (!accessToken) {
    return <Navigate to="/signin" replace />;
  }

  return <Outlet></Outlet>;
};

export default ProtectedRoute;
