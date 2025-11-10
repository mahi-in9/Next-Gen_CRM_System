import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Bell, Menu, X, UserCircle2, LogOut } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/authSlice";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications] = useState(3); // replace with Redux state later

  // ✅ Get logged-in user role from Redux Auth slice
  const { user } = useSelector((state) => state.auth);
  const role = user?.role?.toUpperCase() || "SALES";

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  // ✅ Role-aware navigation links
  const navLinks = [
    { path: "/", label: "Home" },
    ...(role === "ADMIN" ? [{ path: "/users", label: "Users" }] : []), // only ADMIN
    { path: "dashboard", label: "Dashboard" },
    { path: "/deals", label: "Deals" },
    { path: "/tasks", label: "Tasks" },
    { path: "/contacts", label: "Contacts" },
    { path: "/profile", label: "Profile" },
  ];

  return (
    <>
      {/* ======================== NAVBAR ======================== */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Brand */}
            <Link
              to="/"
              className="text-2xl font-bold text-indigo-600 tracking-tight"
            >
              NextGenCRM
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-6">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `text-sm font-medium transition ${
                      isActive
                        ? "text-indigo-600 border-b-2 border-indigo-600 pb-1"
                        : "text-gray-700 hover:text-indigo-600"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              {/* Notifications */}
              <button
                onClick={() => navigate("/notifications")}
                className="relative p-2 rounded-full hover:bg-gray-100"
              >
                <Bell className="h-5 w-5 text-gray-700" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold rounded-full px-1.5">
                    {notifications}
                  </span>
                )}
              </button>

              {/* Profile */}
              <button
                onClick={() => navigate("/profile")}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <UserCircle2 className="h-6 w-6 text-gray-700" />
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="ml-2 bg-indigo-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-indigo-700 transition"
              >
                Logout
              </button>
            </div>

            {/* Mobile Sidebar Toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-md hover:bg-gray-100"
            >
              <Menu className="h-6 w-6 text-gray-800" />
            </button>
          </div>
        </div>
      </nav>

      {/* ======================== SIDEBAR (Mobile) ======================== */}
      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 z-50 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-indigo-600">NextGenCRM</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-md hover:bg-gray-100"
          >
            <X className="h-6 w-6 text-gray-700" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `block text-base font-medium rounded-md px-2 py-1.5 transition ${
                  isActive
                    ? "text-indigo-600 bg-indigo-50"
                    : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}

          {/* Notifications */}
          <button
            onClick={() => {
              navigate("/notifications");
              setSidebarOpen(false);
            }}
            className="flex items-center justify-between w-full px-2 py-1.5 text-gray-700 rounded-md hover:text-indigo-600 hover:bg-gray-50"
          >
            <span className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </span>
            {notifications > 0 && (
              <span className="bg-red-500 text-white text-xs font-semibold rounded-full px-2">
                {notifications}
              </span>
            )}
          </button>

          {/* Profile */}
          <button
            onClick={() => {
              navigate("/profile");
              setSidebarOpen(false);
            }}
            className="flex items-center gap-2 w-full px-2 py-1.5 text-gray-700 rounded-md hover:text-indigo-600 hover:bg-gray-50"
          >
            <UserCircle2 className="h-5 w-5" />
            Profile
          </button>

          {/* Logout */}
          <button
            onClick={() => {
              handleLogout();
              setSidebarOpen(false);
            }}
            className="flex items-center gap-2 w-full mt-4 bg-indigo-600 text-white py-2 px-3 rounded-md text-sm hover:bg-indigo-700 transition"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </nav>
      </aside>
    </>
  );
};

export default Navbar;
