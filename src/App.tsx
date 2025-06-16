import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "./hooks/useAuthStore";
import { AuthRouter } from "./router/AuthRouter";
import { Loader } from "./components/ui/Loader";
import DashboardLayout from "./Components/layout/DashboardLayout";

function App() {
  const { status, checkAuthToken } = useAuthStore();
  const isAuthenticated = status === "authenticated";
  const isLoading = status === "checking";

  useEffect(() => {
    checkAuthToken();
  }, []);

  if (isLoading) return <Loader />;

  return (
    <BrowserRouter>
      <Routes>
        {!isAuthenticated && (
          <>
            <Route path="/*" element={<AuthRouter />} />
          </>
        )}
        {isAuthenticated && (
          <Route path="/*" element={<DashboardLayout />} />
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;