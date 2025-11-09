// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { user, accessToken } = useSelector((state) => state.auth);

  // 1️⃣ Wait until token is checked and user populated
  // If there's a token but user isn't set yet, hold render
  if (accessToken && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  // 2️⃣ Not logged in → redirect to login
  if (!accessToken || !user) {
    console.warn("ProtectedRoute → No user found, redirecting to /login");
    return <Navigate to="/login" replace />;
  }

  // 3️⃣ Extract role from decoded token payload
  const role = user.role || user?.user?.role;

  // 4️⃣ Check role authorization
  if (!allowedRoles.includes(role)) {
    console.warn(`ProtectedRoute → Role '${role}' not authorized`);
    return <Navigate to="/unauthorized" replace />;
  }

  // ✅ 5️⃣ Authorized
  return children;
};

export default ProtectedRoute;
