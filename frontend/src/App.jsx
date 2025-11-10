// src/App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadUserFromToken } from "./features/authSlice";
import Loader from "./components/Loader";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

/* =========================================================
   📦 Lazy-loaded Pages (Performance Optimized)
========================================================= */
const LandingPage = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Deals = lazy(() => import("./pages/deals"));
const Tasks = lazy(() => import("./pages/Tasks"));
const Contacts = lazy(() => import("./pages/Contact"));
const Notifications = lazy(() => import("./pages/Notification"));
const Profile = lazy(() => import("./pages/Profile"));
const UserList = lazy(() => import("./pages/UserList"));
const HistoryPage = lazy(() => import("./pages/History"));
const ActivityFeed = lazy(() => import("./pages/ActivityFeed"));
const NotFound = lazy(() => import("./pages/Error/NotFound"));
// const Unauthorized = lazy(() => import("./pages/Error/Unauthorized")); // optional

/* =========================================================
   ⚙️ Main Application Component
========================================================= */
function App() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);

  // ✅ Persist login on refresh
  useEffect(() => {
    dispatch(loadUserFromToken());
  }, [dispatch]);

  if (loading) return <Loader />;

  return (
    <Router>
      {/* Navbar visible only after authentication */}
      {user && <Navbar />}

      <Suspense fallback={<Loader />}>
        <Routes>
          {/* ======================== PUBLIC ROUTES ======================== */}
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/login"
            element={!user ? <Login /> : <Navigate to="/dashboard" replace />}
          />
          <Route
            path="/signup"
            element={!user ? <Signup /> : <Navigate to="/dashboard" replace />}
          />

          {/* ======================== PROTECTED ROUTES ======================== */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "SALES"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/deals"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "SALES"]}>
                <Deals />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tasks"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "SALES"]}>
                <Tasks />
              </ProtectedRoute>
            }
          />

          <Route
            path="/contacts"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "SALES"]}>
                <Contacts />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "SALES"]}>
                <Notifications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/system-history"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "SALES"]}>
                <HistoryPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/activities"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "SALES"]}>
                <ActivityFeed />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "SALES"]}>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* 🔒 ADMIN-ONLY */}
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <UserList />
              </ProtectedRoute>
            }
          />

          {/* ======================== ERROR / FALLBACK ROUTES ======================== */}
          {/* <Route path="/unauthorized" element={<Unauthorized />} /> */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
