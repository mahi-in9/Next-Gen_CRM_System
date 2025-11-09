import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchLeadActivities,
  createActivity,
  updateActivity,
  deleteActivity,
} from "../features/activitySlice";
import { Plus, X } from "lucide-react";

const ActivityFeed = ({ leadId = 1 }) => {
  const dispatch = useDispatch();
  const {
    items = [],
    loading,
    error,
  } = useSelector((state) => state.activities);
  const { user } = useSelector((state) => state.auth); // { id, name, role, teamId }

  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [formData, setFormData] = useState({
    details: "",
    type: "NOTE",
  });
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");

  /* ------------------------- Fetch Activities ------------------------- */
  useEffect(() => {
    if (leadId) dispatch(fetchLeadActivities(leadId));
  }, [dispatch, leadId]);

  /* ------------------------- Handle Form ------------------------- */
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAddActivity = (e) => {
    e.preventDefault();
    if (!formData.details.trim()) return;

    dispatch(
      createActivity({
        leadId,
        type: formData.type,
        details: formData.details.trim(),
        userId: user?.id,
        teamId: user?.teamId,
      })
    ).then(() => {
      setFormData({ details: "", type: "NOTE" });
      setShowCreatePanel(false);
    });
  };

  /* ------------------------- Edit Activity ------------------------- */
  const handleEdit = (activity) => {
    const role = user?.role?.toLowerCase();
    const canEdit =
      role === "admin" ||
      (role === "manager" && activity.teamId === user?.teamId) ||
      (role === "sales" && activity.userId === user?.id);

    if (!canEdit)
      return alert("You don’t have permission to edit this activity.");

    setEditId(activity.id);
    setEditText(activity.details);
  };

  const handleSaveEdit = (id) => {
    if (!editText.trim()) return;
    dispatch(updateActivity({ id, updates: { details: editText.trim() } }));
    setEditId(null);
    setEditText("");
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setEditText("");
  };

  /* ------------------------- Delete Activity ------------------------- */
  const handleDelete = (activity) => {
    const role = user?.role?.toLowerCase();
    const canDelete =
      role === "admin" ||
      (role === "manager" && activity.teamId === user?.teamId) ||
      (role === "sales" && activity.userId === user?.id);

    if (!canDelete)
      return alert("You don’t have permission to delete this activity.");

    if (confirm("Delete this activity permanently?")) {
      dispatch(deleteActivity(activity.id));
    }
  };

  /* ------------------------- Filter by Role ------------------------- */
  const filteredActivities = useMemo(() => {
    if (!user) return [];
    const role = user.role?.toLowerCase();

    switch (role) {
      case "admin":
        return items;
      case "manager":
        return items.filter((a) => a.teamId === user.teamId);
      case "sales":
        return items.filter((a) => a.userId === user.id);
      default:
        return [];
    }
  }, [items, user]);

  /* ------------------------- Refresh ------------------------- */
  const handleRefresh = () => {
    dispatch(fetchLeadActivities(leadId));
  };

  /* ------------------------- UI ------------------------- */
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Activity List Section */}
      <div className="flex-1 bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-semibold text-gray-800">Activity Feed</h2>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="text-sm px-3 py-1 bg-gray-100 border rounded-md hover:bg-gray-200 disabled:opacity-50"
          >
            Refresh
          </button>
        </div>

        {loading && (
          <p className="text-gray-500 text-sm text-center mb-3">
            Loading activities...
          </p>
        )}

        {error && (
          <p className="text-red-500 text-sm text-center mb-3">{error}</p>
        )}

        {!loading && !error && filteredActivities.length === 0 && (
          <p className="text-gray-500 italic text-center">
            No activities found for your role.
          </p>
        )}

        <ul className="space-y-4">
          {filteredActivities.map((activity) => (
            <li
              key={activity.id}
              className="group border border-gray-200 bg-gray-50 rounded-lg p-4 hover:shadow-sm transition"
            >
              {editId === activity.id ? (
                <div>
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full border p-2 rounded-md focus:ring focus:ring-indigo-200 focus:outline-none"
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      onClick={() => handleSaveEdit(activity.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="bg-gray-400 text-white px-3 py-1 rounded-md hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-gray-800">
                      {activity.details}
                    </p>
                    <div className="space-x-2 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => handleEdit(activity)}
                        className="text-blue-600 text-sm hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(activity)}
                        className="text-red-600 text-sm hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 mt-1">
                    <span className="font-medium text-indigo-600">
                      {activity.type}
                    </span>{" "}
                    by {activity.user?.name || "Unknown"} on{" "}
                    {new Date(activity.createdAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Right Sidebar - Create Activity */}
      <div className="hidden lg:block w-80 bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Create Activity
        </h3>
        <form onSubmit={handleAddActivity} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full border p-2 rounded-md focus:ring focus:ring-indigo-200 focus:outline-none"
              required
            >
              <option value="NOTE">Note</option>
              <option value="CALL">Call</option>
              <option value="EMAIL">Email</option>
              <option value="MEETING">Meeting</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Details
            </label>
            <textarea
              name="details"
              value={formData.details}
              onChange={handleChange}
              placeholder="Describe the activity..."
              className="w-full border p-2 rounded-md focus:ring focus:ring-indigo-200 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Activity"}
          </button>
        </form>
      </div>

      {/* Floating Button + Modal for Mobile */}
      <button
        onClick={() => setShowCreatePanel(true)}
        className="lg:hidden fixed bottom-5 right-5 bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition"
      >
        <Plus className="h-6 w-6" />
      </button>

      {showCreatePanel && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-11/12 max-w-md p-6 relative shadow-lg">
            <button
              onClick={() => setShowCreatePanel(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Create Activity
            </h3>
            <form onSubmit={handleAddActivity} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full border p-2 rounded-md focus:ring focus:ring-indigo-200 focus:outline-none"
                  required
                >
                  <option value="NOTE">Note</option>
                  <option value="CALL">Call</option>
                  <option value="EMAIL">Email</option>
                  <option value="MEETING">Meeting</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Details
                </label>
                <textarea
                  name="details"
                  value={formData.details}
                  onChange={handleChange}
                  placeholder="Describe the activity..."
                  className="w-full border p-2 rounded-md focus:ring focus:ring-indigo-200 focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Add Activity"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
