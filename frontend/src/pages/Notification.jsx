import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../features/notificationSlice";
import { Bell, CheckCircle, Trash2, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const Notification = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleMarkAllRead = () => dispatch(markAllNotificationsAsRead());
  const handleMarkAsRead = (id) => dispatch(markNotificationAsRead(id));
  const handleDelete = (id) => dispatch(deleteNotification(id));

  return (
    <div className="max-w-4xl mx-auto mt-8 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
          <Bell className="h-6 w-6 text-indigo-600" /> Notifications
        </h1>

        {items.length > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700 transition"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-red-500 text-center text-sm mt-4">
          {error.message ||
            "Something went wrong while fetching notifications."}
        </p>
      )}

      {/* Empty State */}
      {!loading && items.length === 0 && (
        <div className="text-center py-10">
          <Bell className="h-10 w-10 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No notifications yet.</p>
        </div>
      )}

      {/* Notification List */}
      <div className="space-y-4">
        {items.map((notification) => (
          <div
            key={notification.id}
            className={`flex items-start justify-between border rounded-lg px-4 py-3 shadow-sm transition ${
              notification.read
                ? "bg-white hover:bg-gray-50"
                : "bg-indigo-50 hover:bg-indigo-100 border-indigo-200"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-1 w-2 h-2 rounded-full ${
                  notification.read ? "bg-gray-300" : "bg-indigo-600"
                }`}
              ></div>
              <div>
                <p className="text-gray-800 text-sm font-medium">
                  {notification.message}
                </p>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                  <Clock className="h-3 w-3" />
                  <span>
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {!notification.read && (
                <button
                  onClick={() => handleMarkAsRead(notification.id)}
                  className="text-indigo-600 hover:text-indigo-800 transition"
                  title="Mark as read"
                >
                  <CheckCircle className="h-5 w-5" />
                </button>
              )}

              <button
                onClick={() => handleDelete(notification.id)}
                className="text-gray-500 hover:text-red-600 transition"
                title="Delete notification"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notification;
