import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchHistory,
  deleteHistory,
  cleanupOldHistory,
  setFilters,
  clearMessages,
} from "../features/historySlice";

export default function HistoryPage() {
  const dispatch = useDispatch();
  const {
    logs,
    total,
    totalPages,
    page,
    limit,
    filters,
    loading,
    error,
    successMessage,
  } = useSelector((state) => state.history);

  const [selectedIds, setSelectedIds] = useState([]);

  // Initial load
  useEffect(() => {
    dispatch(fetchHistory({ ...filters, page }));
  }, [dispatch, filters, page]);

  // Clear status messages after a few seconds
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => dispatch(clearMessages()), 4000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage, dispatch]);

  const handleSearch = (e) => {
    dispatch(setFilters({ search: e.target.value }));
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm("Are you sure you want to delete selected logs?")) {
      dispatch(deleteHistory(selectedIds)).then(() =>
        dispatch(fetchHistory({ ...filters, page }))
      );
    }
  };

  const handleDeleteAll = () => {
    if (window.confirm("Are you sure you want to delete all history?")) {
      dispatch(deleteHistory([])).then(() =>
        dispatch(fetchHistory({ ...filters, page }))
      );
    }
  };

  const handleCleanup = () => {
    if (window.confirm("Cleanup logs older than 90 days?")) {
      dispatch(cleanupOldHistory()).then(() =>
        dispatch(fetchHistory({ ...filters, page }))
      );
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handlePageChange = (newPage) => {
    dispatch(fetchHistory({ ...filters, page: newPage }));
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <h1 className="text-xl sm:text-2xl font-semibold">System History</h1>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Search history..."
            onChange={handleSearch}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleCleanup}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-md text-sm"
          >
            Cleanup Old
          </button>
          <button
            onClick={handleDeleteAll}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm"
          >
            Delete All
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-3 text-sm">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-100 text-green-700 p-3 rounded-md mb-3 text-sm">
          {successMessage}
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-500">
          Loading history...
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No history records found.
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full text-sm border">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="p-3 border text-left">Select</th>
                  <th className="p-3 border text-left">User</th>
                  <th className="p-3 border text-left">Action</th>
                  <th className="p-3 border text-left">Entity</th>
                  <th className="p-3 border text-left">Description</th>
                  <th className="p-3 border text-left">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-gray-50 transition-colors duration-100"
                  >
                    <td className="p-3 border text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(log.id)}
                        onChange={() => toggleSelect(log.id)}
                      />
                    </td>
                    <td className="p-3 border">{log.user?.name || "System"}</td>
                    <td className="p-3 border font-medium text-indigo-600">
                      {log.action}
                    </td>
                    <td className="p-3 border">{log.entityType || "-"}</td>
                    <td className="p-3 border text-gray-700">
                      {log.description}
                    </td>
                    <td className="p-3 border text-gray-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="border rounded-lg bg-white p-3 shadow-sm"
              >
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-semibold text-indigo-600 text-sm">
                    {log.action}
                  </h3>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(log.id)}
                    onChange={() => toggleSelect(log.id)}
                  />
                </div>
                <p className="text-xs text-gray-600 mb-1">
                  User: {log.user?.name || "System"}
                </p>
                <p className="text-xs text-gray-600 mb-1">
                  Entity: {log.entityType || "-"}
                </p>
                <p className="text-xs text-gray-800 mb-1">{log.description}</p>
                <p className="text-xs text-gray-500">
                  {new Date(log.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          {/* Bulk Actions */}
          {selectedIds.length > 0 && (
            <div className="flex justify-between mt-3 bg-gray-50 p-3 rounded-md border">
              <p className="text-sm text-gray-700">
                {selectedIds.length} selected
              </p>
              <button
                onClick={handleDeleteSelected}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
              >
                Delete Selected
              </button>
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-end items-center gap-2 mt-5">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1 border rounded-md disabled:opacity-40"
            >
              Prev
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1 border rounded-md disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
