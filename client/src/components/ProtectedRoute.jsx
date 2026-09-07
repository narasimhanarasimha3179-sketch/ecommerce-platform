import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ admin = false }) {
  const { userInfo } = useAuth();
  const location = useLocation();

  if (!userInfo?.token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (admin && userInfo?.user?.role !== "admin" && userInfo?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
