import { Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import MainLayout from "../layouts/MainLayout";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import NotFound from "../pages/NotFound";

const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  HR: "/hr",
  FINANCE: "/finance",
  SUPPLY_CHAIN: "/supply-chain",
  USERS: "/users",
};

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  if (isLoading) return <div>Loading...</div>;

  return isAuthenticated ? children : <Navigate to={ROUTES.LOGIN} replace />;
};

const PublicRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  if (isLoading) return <div>Loading...</div>;

  return isAuthenticated ? (
    <Navigate to={ROUTES.DASHBOARD} replace />
  ) : (
    children
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path={ROUTES.LOGIN}
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path={ROUTES.REGISTER}
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Protected Routes with Layout */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
        <Route path={ROUTES.HR} element={<div>HR Page Coming Soon</div>} />
        <Route path={ROUTES.FINANCE} element={<div>Finance Page Coming Soon</div>} />
        <Route path={ROUTES.SUPPLY_CHAIN} element={<div>Supply Chain Coming Soon</div>} />
        <Route path={ROUTES.USERS} element={<div>Users Page Coming Soon</div>} />
      </Route>

      {/* Default */}
      <Route
        path={ROUTES.HOME}
        element={<Navigate to={ROUTES.DASHBOARD} replace />}
      />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;