import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";

import AppRoutes from "./routes/AppRoutes";
import useAuthStore from "./store/authStore";

import "./App.css";

function App() {
  const initialize = useAuthStore((state) => state.initialize);

  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return <div className="app-loader">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
