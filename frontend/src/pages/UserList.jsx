import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllUsers,
  updateUser,
  deleteUser,
  clearUserState,
} from "../features/userSlice";
import { Edit, Trash2, Save, X, Search, ShieldCheck } from "lucide-react";

const UserList = () => {
  const dispatch = useDispatch();
  const { users, loading, error, successMessage } = useSelector(
    (state) => state.user
  );

  const authState = useSelector((state) => state.auth);
  console.log("Auth state:", authState);

  const [searchTerm, setSearchTerm] = useState("");
  const [editUserId, setEditUserId] = useState(null);
  const [editedRole, setEditedRole] = useState("");

  // ==========================================
  // Fetch users on mount
  // ==========================================
  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  // ==========================================
  // Toast / Alert system (native)
  // ==========================================
  useEffect(() => {
    if (successMessage) {
      alert(successMessage);
      dispatch(clearUserState());
    }
    if (error) {
      alert(`Error: ${error}`);
    }
  }, [successMessage, error, dispatch]);

  // ==========================================
  // Filter users by search term
  // ==========================================
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    const lower = searchTerm.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(lower) ||
        u.email.toLowerCase().includes(lower) ||
        u.role.toLowerCase().includes(lower)
    );
  }, [users, searchTerm]);

  // ==========================================
  // Handlers
  // ==========================================
  const handleEditClick = (user) => {
    setEditUserId(user.id);
    setEditedRole(user.role);
  };

  const handleCancelEdit = () => {
    setEditUserId(null);
    setEditedRole("");
  };

  const handleSaveRole = (id) => {
    if (!editedRole) return;
    dispatch(updateUser({ id, data: { role: editedRole } }));
    setEditUserId(null);
  };

  const handleDelete = async (id, name) => {
    if (
      window.confirm(
        `Are you sure you want to delete user "${name}"? This action cannot be undone.`
      )
    ) {
      dispatch(deleteUser(id));
    }
  };

  // ==========================================
  // Render
  // ==========================================
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <ShieldCheck size={24} className="text-blue-500" />
          User Management
        </h1>
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-400 outline-none pr-10"
          />
          <Search size={18} className="absolute right-3 top-3 text-gray-500" />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center mt-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
          <strong className="font-semibold">Error: </strong> {error}
        </div>
      )}

      {/* No Users */}
      {!loading && !error && filteredUsers.length === 0 && (
        <p className="text-center text-gray-500 mt-10">
          No users found matching your search.
        </p>
      )}

      {/* Table */}
      {!loading && filteredUsers.length > 0 && (
        <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600">
                  ID
                </th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600">
                  Name
                </th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600">
                  Email
                </th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600">
                  Role
                </th>
                <th className="py-3 px-6 text-center text-sm font-semibold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-t hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-6 text-sm text-gray-700">{user.id}</td>
                  <td className="py-3 px-6 text-sm text-gray-700">
                    {user.name}
                  </td>
                  <td className="py-3 px-6 text-sm text-gray-700">
                    {user.email}
                  </td>
                  <td className="py-3 px-6 text-sm">
                    {editUserId === user.id ? (
                      <select
                        value={editedRole}
                        onChange={(e) => setEditedRole(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-400 outline-none"
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="MANAGER">MANAGER</option>
                        <option value="SALES">SALES</option>
                      </select>
                    ) : (
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          user.role === "ADMIN"
                            ? "bg-blue-100 text-blue-700"
                            : user.role === "MANAGER"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {user.role}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-6 text-center">
                    {editUserId === user.id ? (
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => handleSaveRole(user.id)}
                          className="flex items-center gap-1 px-3 py-1 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                        >
                          <Save size={14} /> Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
                        >
                          <X size={14} /> Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => handleEditClick(user)}
                          className="flex items-center gap-1 px-3 py-1 text-sm border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition"
                        >
                          <Edit size={14} /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.name)}
                          className="flex items-center gap-1 px-3 py-1 text-sm border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserList;
