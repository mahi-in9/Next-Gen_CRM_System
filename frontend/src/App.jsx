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
import UserList from "./pages/UserList";

// Lazy loaded pages for better performance
const LandingPage = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Profile = lazy(() => import("./pages/Profile"));
const Leads = lazy(() => import("./pages/Leads"));
const AnalyticsDashboard = lazy(() => import("./pages/AnalyticsDashboard"));
const ActivityFeed = lazy(() => import("./pages/ActivityFeed"));
// const Unauthorized = lazy(() => import("./pages/Error/Unauthorized"));
const NotFound = lazy(() => import("./pages/Error/NotFound"));

function App() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);

  // Persist login on refresh using token
  useEffect(() => {
    dispatch(loadUserFromToken());
  }, [dispatch]);

  if (loading) return <Loader />;

  return (
    <>
      {user && <Navbar />} {/* Navbar visible only for authenticated users */}
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/login"
            element={!user ? <Login /> : <Navigate to="/dashboard" replace />}
          />
          <Route
            path="/signup"
            element={!user ? <Signup /> : <Navigate to="/dashboard" replace />}
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "SALES"]}>
                <AnalyticsDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/leads"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "MANAGER", "SALES"]}>
                <Leads />
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
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <UserList />
              </ProtectedRoute>
            }
          />

          {/* <Route path="/users" element={<UserList />} /> */}

          {/* Error / Fallback Rhoutes */}
          {/* <Route path="/unauthorized" element={<Unauthorized />} /> */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
