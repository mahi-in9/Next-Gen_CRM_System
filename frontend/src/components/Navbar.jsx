import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Bell, Menu, X, UserCircle2 } from "lucide-react"; // using lucide icons
import { useDispatch } from "react-redux";
import { logout } from "../features/authSlice";

const Navbar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications] = useState(3); // Replace with real data from Redux slice later
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout()); // ✅ clear Redux + localStorage + axios headers
    navigate("/login");
  };
  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/dashboard", label: "Dashboard" },
    { path: "/leads", label: "Leads" },
    { path: "/activities", label: "Activities" },
    { path: "/profile", label: "Profile" },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Flex */}
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
                  `text-sm font-medium ${
                    isActive
                      ? "text-indigo-600 border-b-2 border-indigo-600 pb-1"
                      : "text-gray-600 hover:text-indigo-600"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            {/* Notification Bell */}
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

            {/* Profile Icon */}
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2 text-gray-700 hover:text-indigo-600"
            >
              <UserCircle2 className="h-6 w-6" />
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="ml-4 bg-indigo-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-indigo-700 transition"
            >
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              {menuOpen ? (
                <X className="h-6 w-6 text-gray-800" />
              ) : (
                <Menu className="h-6 w-6 text-gray-800" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-md">
          <div className="px-4 pt-3 pb-4 space-y-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block text-base font-medium ${
                    isActive
                      ? "text-indigo-600"
                      : "text-gray-700 hover:text-indigo-600"
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
                setMenuOpen(false);
              }}
              className="flex items-center gap-2 w-full text-gray-700 hover:text-indigo-600"
            >
              <Bell className="h-5 w-5" />
              Notifications
              {notifications > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-semibold rounded-full px-2">
                  {notifications}
                </span>
              )}
            </button>

            {/* Profile */}
            <button
              onClick={() => {
                navigate("/profile");
                setMenuOpen(false);
              }}
              className="flex items-center gap-2 w-full text-gray-700 hover:text-indigo-600"
            >
              <UserCircle2 className="h-5 w-5" />
              Profile
            </button>

            {/* Logout */}
            <button
              onClick={() => {
                handleLogout();
                setMenuOpen(false);
              }}
              className="w-full bg-indigo-600 text-white py-2 rounded-md text-sm hover:bg-indigo-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
