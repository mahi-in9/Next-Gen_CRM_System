import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers, deleteUser } from "../features/userSlice";
import { toast } from "react-toastify"; // for nice alerts (npm i react-toastify)
import { FaTrashAlt, FaSyncAlt } from "react-icons/fa";

export default function Users() {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector((state) => state.users);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch all users
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Refresh users manually
  const handleRefresh = useCallback(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Delete user with confirmation
  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete user "${name}"?`
    );
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await dispatch(deleteUser(id)).unwrap();
      toast.success(`User "${name}" deleted successfully.`);
    } catch (err) {
      toast.error(err || "Failed to delete user.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500 text-lg animate-pulse">Loading users...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col justify-center items-center h-64 text-center">
        <p className="text-red-500 font-semibold mb-2">Error: {error}</p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Retry
        </button>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
          User Management
        </h1>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-60"
        >
          <FaSyncAlt className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {list.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No users found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr className="text-left text-gray-700 dark:text-gray-200">
                <th className="p-3 border-b border-gray-200 dark:border-gray-700">
                  ID
                </th>
                <th className="p-3 border-b border-gray-200 dark:border-gray-700">
                  Name
                </th>
                <th className="p-3 border-b border-gray-200 dark:border-gray-700">
                  Email
                </th>
                <th className="p-3 border-b border-gray-200 dark:border-gray-700">
                  Role
                </th>
                <th className="p-3 border-b border-gray-200 dark:border-gray-700 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {list.map((u) => (
                <tr
                  key={u.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  <td className="p-3 text-gray-700 dark:text-gray-300">
                    {u.id}
                  </td>
                  <td className="p-3 text-gray-800 dark:text-gray-100 font-medium">
                    {u.name}
                  </td>
                  <td className="p-3 text-gray-600 dark:text-gray-300">
                    {u.email}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 text-sm rounded-full ${
                        u.role === "ADMIN"
                          ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDelete(u.id, u.name)}
                      disabled={deletingId === u.id}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md flex items-center gap-1 ml-auto transition disabled:opacity-50"
                    >
                      {deletingId === u.id ? (
                        <span className="animate-pulse">Deleting...</span>
                      ) : (
                        <>
                          <FaTrashAlt /> Delete
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
