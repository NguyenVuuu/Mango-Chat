import { BrowserRouter, Route, Routes } from "react-router-dom";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import ChatAppPage from "./pages/ChatAppPage";
import { Toaster } from "sonner";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { useThemeStore } from "./store/useThemeStore";
import { useEffect } from "react";
import { useAuthStore } from "./store/useAuthStore";
import { useSocketStore } from "./store/useSocketStore";
function App() {
  const { isDark, setTheme } = useThemeStore();
  const { accessToken } = useAuthStore();
  const { connectSocket, disconnectSocket } = useSocketStore();

  useEffect(() => {
    setTheme(isDark);
    console.log("app.tsx theme dark:", isDark);
  }, [isDark]);

  useEffect(() => {
    if (accessToken) {
      connectSocket();
    }
    return () => disconnectSocket();
  }, [accessToken]);
  return (
    <>
      <Toaster richColors />
      <BrowserRouter>
        <Routes>
          {/* public routes */}
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          {/* private routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<ChatAppPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
