import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  selectAllTasks,
  selectTasksLoading,
} from "../features/tasksSlice";
import { fetchContacts, selectAllContacts } from "../features/contactSlice";
import { fetchDeals, selectAllDeals } from "../features/dealSlice";
import { useForm } from "react-hook-form";
import { Dialog } from "@headlessui/react";
import { Plus, Pencil, Trash2, CheckCircle2 } from "lucide-react";

export default function Tasks() {
  const dispatch = useDispatch();

  const tasks = useSelector(selectAllTasks);
  const loading = useSelector(selectTasksLoading);
  const contacts = useSelector(selectAllContacts);
  const deals = useSelector(selectAllDeals);

  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      priority: "Medium",
      status: "To_Do",
      duedate: "",
      contactid: "",
      dealid: "",
    },
  });

  const editForm = useForm({
    defaultValues: {
      title: "",
      description: "",
      priority: "Medium",
      status: "To_Do",
      duedate: "",
      contactid: "",
      dealid: "",
    },
  });

  useEffect(() => {
    dispatch(fetchTasks());
    dispatch(fetchContacts());
    dispatch(fetchDeals());
  }, [dispatch]);

  const onSubmit = (data) => {
    dispatch(createTask(data)).then(() => {
      form.reset();
      setOpen(false);
    });
  };

  const onEditSubmit = (data) => {
    if (selectedTask) {
      dispatch(updateTask({ id: selectedTask.id, data })).then(() => {
        setEditOpen(false);
        setSelectedTask(null);
      });
    }
  };

  const handleEdit = (task) => {
    setSelectedTask(task);
    editForm.reset({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      status: task.status,
      duedate: task.duedate ? task.duedate.split("T")[0] : "",
      contactid: task.contactid || "",
      dealid: task.dealid || "",
    });
    setEditOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Tasks</h1>
          <p className="text-sm text-gray-500">
            Manage your personal and CRM-related tasks
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Task
        </button>
      </div>

      {loading ? (
        <div className="grid gap-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-gray-100 animate-pulse rounded-lg"
            />
          ))}
        </div>
      ) : tasks.length > 0 ? (
        <div className="grid gap-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                    <span className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium">
                      {task.priority}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full font-medium ${
                        task.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : task.status === "In_Progress"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {task.status.replace("_", " ")}
                    </span>
                    {task.duedate && (
                      <span>
                        Due:{" "}
                        {new Date(task.duedate).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    )}
                    {task.contactid && (
                      <span>
                        Contact:{" "}
                        {contacts.find((c) => c.id === task.contactid)?.name ||
                          "N/A"}
                      </span>
                    )}
                    {task.dealid && (
                      <span>
                        Deal:{" "}
                        {deals.find((d) => d.id === task.dealid)?.title ||
                          "N/A"}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {task.status !== "Completed" && (
                    <button
                      onClick={() =>
                        dispatch(
                          updateTaskStatus({ id: task.id, status: "Completed" })
                        )
                      }
                      className="p-2 rounded-lg hover:bg-green-100 text-green-600"
                      title="Mark Complete"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(task)}
                    className="p-2 rounded-lg hover:bg-blue-100 text-blue-600"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => dispatch(deleteTask(task.id))}
                    className="p-2 rounded-lg hover:bg-red-100 text-red-600"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-gray-600 mb-3 text-lg font-medium">No tasks yet</p>
          <p className="text-sm text-gray-500 mb-5">
            Create your first task to start managing your workflow
          </p>
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Task
          </button>
        </div>
      )}

      {/* =========================
         🟢 Create Task Dialog
      ========================== */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 space-y-4">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              Create Task
            </Dialog.Title>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <input
                type="text"
                placeholder="Title *"
                {...form.register("title", { required: true })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
              />
              <textarea
                placeholder="Description"
                {...form.register("description")}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  {...form.register("priority")}
                  className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                <select
                  {...form.register("status")}
                  className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="To_Do">To Do</option>
                  <option value="In_Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <input
                type="date"
                {...form.register("duedate")}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
              />
              <select
                {...form.register("contactid")}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Contact</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select
                {...form.register("dealid")}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Deal</option>
                {deals.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title}
                  </option>
                ))}
              </select>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      </Dialog>

      {/* =========================
         🟡 Edit Task Dialog
      ========================== */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 space-y-4">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              Edit Task
            </Dialog.Title>

            <form
              onSubmit={editForm.handleSubmit(onEditSubmit)}
              className="space-y-3"
            >
              <input
                type="text"
                placeholder="Title *"
                {...editForm.register("title", { required: true })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
              />
              <textarea
                placeholder="Description"
                {...editForm.register("description")}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  {...editForm.register("priority")}
                  className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                <select
                  {...editForm.register("status")}
                  className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="To_Do">To Do</option>
                  <option value="In_Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <input
                type="date"
                {...editForm.register("duedate")}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
              />
              <select
                {...editForm.register("contactid")}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Contact</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select
                {...editForm.register("dealid")}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Deal</option>
                {deals.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title}
                  </option>
                ))}
              </select>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
