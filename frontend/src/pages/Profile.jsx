import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { refreshAccessToken, logout } from "../features/authSlice";
import axiosInstance from "../api/axiosInstance";

const Profile = () => {
  const dispatch = useDispatch();
  const { user, accessToken, loading } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(user || null);
  const [message, setMessage] = useState("");
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setFetching(true);
        const res = await axiosInstance.get("/auth/me");
        setProfile(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch profile:", err);
        // If unauthorized, try refreshing token automatically
        if (err.response?.status === 401) {
          try {
            await dispatch(refreshAccessToken()).unwrap();
            const retryRes = await axiosInstance.get("/auth/me");
            setProfile(retryRes.data);
          } catch (refreshErr) {
            console.error("Token refresh failed:", refreshErr);
            setMessage("Session expired. Please log in again.");
            dispatch(logout());
          }
        }
      } finally {
        setFetching(false);
      }
    };

    // Fetch if no profile yet but valid token exists
    if (!profile && accessToken) fetchProfile();
  }, [accessToken, profile, dispatch]);

  const handleRefreshToken = async () => {
    try {
      await dispatch(refreshAccessToken()).unwrap();
      setMessage("✅ Access token refreshed successfully.");
    } catch {
      setMessage("❌ Failed to refresh token.");
    }
  };

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      await axiosInstance.post("/auth/logout", { refreshToken });
    } catch (err) {
      console.error("Logout API failed:", err);
    } finally {
      dispatch(logout());
      setMessage("👋 Logged out successfully.");
    }
  };

  if (loading || fetching)
    return (
      <div className="p-6 text-center text-gray-300">Loading profile...</div>
    );

  return (
    <div className="max-w-md mx-auto mt-10 bg-gray-800 text-white rounded-xl shadow-lg p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-center mb-4">User Profile</h1>

      {profile ? (
        <div className="space-y-2">
          <p>
            <span className="font-medium">Name:</span> {profile.name}
          </p>
          <p>
            <span className="font-medium">Email:</span> {profile.email}
          </p>
          <p>
            <span className="font-medium">Role:</span> {profile.role}
          </p>
        </div>
      ) : (
        <p className="text-gray-400 text-center">
          No profile data available. Please log in again.
        </p>
      )}

      {message && (
        <div className="bg-gray-700 p-2 rounded text-sm text-center mt-4">
          {message}
        </div>
      )}

      <div className="flex justify-between mt-6">
        <button
          onClick={handleRefreshToken}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition"
        >
          Refresh Token
        </button>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
