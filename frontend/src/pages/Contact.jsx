import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchContacts,
  createContact,
  updateContact,
  deleteContact,
  fetchContactActivities,
  createContactActivity,
  selectAllContacts,
  selectContactsLoading,
  selectActivitiesByContact,
} from "../features/contactSlice";
import {
  Plus,
  Mail,
  Phone,
  Users,
  MessageSquare,
  FileText,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

/* =========================================================
   📘 Contact Management (Responsive - Tailwind only)
========================================================= */
export default function Contact() {
  const dispatch = useDispatch();

  const contacts = useSelector(selectAllContacts);
  const loading = useSelector(selectContactsLoading);

  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    position: "",
    notes: "",
  });
  const [activityNote, setActivityNote] = useState("");

  useEffect(() => {
    dispatch(fetchContacts());
  }, [dispatch]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = () => {
    if (!form.name.trim()) return alert("Name is required");
    dispatch(createContact(form))
      .unwrap()
      .then(() => {
        alert("Contact created successfully");
        setOpenCreate(false);
        setForm({
          name: "",
          email: "",
          phone: "",
          company: "",
          position: "",
          notes: "",
        });
      })
      .catch((err) => alert(err));
  };

  const handleEdit = (contact) => {
    setSelectedContact(contact);
    setForm(contact);
    setOpenEdit(true);
  };

  const handleUpdate = () => {
    dispatch(updateContact({ id: selectedContact.id, data: form }))
      .unwrap()
      .then(() => {
        alert("Contact updated successfully");
        setOpenEdit(false);
        setSelectedContact(null);
      })
      .catch((err) => alert(err));
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this contact?"))
      return;
    dispatch(deleteContact(id))
      .unwrap()
      .then(() => alert("Contact deleted successfully"))
      .catch((err) => alert(err));
  };

  const handleActivityFetch = (id) => dispatch(fetchContactActivities(id));

  const handleAddActivity = () => {
    if (!activityNote.trim()) return;
    dispatch(
      createContactActivity({
        contactId: selectedContact.id,
        type: "Note",
        content: activityNote,
      })
    )
      .unwrap()
      .then(() => {
        setActivityNote("");
        alert("Note added successfully");
      })
      .catch((err) => alert(err));
  };

  const activities = useSelector((state) =>
    selectedContact ? selectActivitiesByContact(state, selectedContact.id) : []
  );

  const getInitials = (name) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  /* =========================================================
     🧭 Render
  ========================================================= */
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Contacts</h1>
          <p className="text-sm text-gray-500">
            Manage your customer and business relationships
          </p>
        </div>
        <button
          onClick={() => setOpenCreate(true)}
          className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm font-medium"
        >
          <Plus className="h-4 w-4" /> Add Contact
        </button>
      </header>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6)
            .fill()
            .map((_, i) => (
              <div
                key={i}
                className="p-6 border rounded-xl bg-white animate-pulse h-40"
              ></div>
            ))}
        </div>
      )}

      {/* Contacts Grid */}
      {!loading && contacts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((c) => (
            <div
              key={c.id}
              className="bg-white p-5 rounded-xl border hover:shadow-md transition cursor-pointer"
              onClick={() => {
                setSelectedContact(c);
                handleActivityFetch(c.id);
              }}
            >
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-lg">
                  {getInitials(c.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold mb-1 truncate">{c.name}</h3>
                  {c.position && c.company && (
                    <p className="text-sm text-gray-500 truncate">
                      {c.position} at {c.company}
                    </p>
                  )}
                  {c.email && (
                    <div className="flex items-center text-sm text-gray-600 gap-2">
                      <Mail className="h-3 w-3" /> {c.email}
                    </div>
                  )}
                  {c.phone && (
                    <div className="flex items-center text-sm text-gray-600 gap-2">
                      <Phone className="h-3 w-3" /> {c.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && contacts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white border rounded-xl">
          <Users className="h-16 w-16 text-gray-400 mb-3" />
          <h3 className="text-lg font-semibold">No contacts yet</h3>
          <p className="text-gray-500 text-sm mb-4">
            Start by adding your first contact
          </p>
          <button
            onClick={() => setOpenCreate(true)}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm font-medium"
          >
            <Plus className="h-4 w-4" /> Add Contact
          </button>
        </div>
      )}

      {/* =======================================================
          📋 Contact Details Modal
      ======================================================= */}
      {selectedContact && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-5 space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 bg-indigo-100 flex items-center justify-center rounded-full text-lg font-semibold text-indigo-700">
                  {getInitials(selectedContact.name)}
                </div>
                <div>
                  <h2 className="text-xl font-semibold">
                    {selectedContact.name}
                  </h2>
                  <p className="text-gray-500 text-sm">
                    {selectedContact.position}{" "}
                    {selectedContact.company && `at ${selectedContact.company}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedContact(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2 border-t pt-3 text-sm text-gray-700">
              {selectedContact.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  {selectedContact.email}
                </div>
              )}
              {selectedContact.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  {selectedContact.phone}
                </div>
              )}
              {selectedContact.notes && (
                <div className="pt-2 text-gray-600 text-sm border-t">
                  <p>{selectedContact.notes}</p>
                </div>
              )}
            </div>

            {/* Activity Section */}
            <div className="pt-4 border-t">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" /> Activity Timeline
              </h4>

              {activities.length > 0 ? (
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {activities.map((a) => (
                    <div
                      key={a.id}
                      className="flex gap-2 text-sm text-gray-700"
                    >
                      <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <p>{a.details}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(a.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No activities yet</p>
              )}

              <div className="flex flex-col sm:flex-row gap-2 mt-3">
                <textarea
                  rows={2}
                  placeholder="Add a note..."
                  value={activityNote}
                  onChange={(e) => setActivityNote(e.target.value)}
                  className="flex-1 resize-none border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button
                  onClick={handleAddActivity}
                  disabled={!activityNote.trim()}
                  className={`px-4 py-2 rounded-md text-white text-sm font-medium ${
                    activityNote.trim()
                      ? "bg-indigo-600 hover:bg-indigo-700"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                >
                  Add
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
              <button
                onClick={() => handleEdit(selectedContact)}
                className="flex items-center justify-center gap-2 border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-100 text-sm"
              >
                <Pencil className="h-4 w-4" /> Edit
              </button>
              <button
                onClick={() => handleDelete(selectedContact.id)}
                className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================
          ✳️ Create/Edit Modal
      ======================================================= */}
      {(openCreate || openEdit) && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl w-full max-w-md p-5 space-y-4">
            <h2 className="text-xl font-semibold">
              {openEdit ? "Edit Contact" : "New Contact"}
            </h2>
            <div className="space-y-3">
              {["name", "email", "phone", "company", "position"].map(
                (field) => (
                  <input
                    key={field}
                    name={field}
                    placeholder={field[0].toUpperCase() + field.slice(1)}
                    value={form[field] || ""}
                    onChange={handleChange}
                    className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                )
              )}
              <textarea
                name="notes"
                placeholder="Notes"
                value={form.notes || ""}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <button
                onClick={() => {
                  setOpenCreate(false);
                  setOpenEdit(false);
                }}
                className="border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-100 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={openEdit ? handleUpdate : handleCreate}
                className="bg-indigo-600 text-white rounded-md px-4 py-2 hover:bg-indigo-700 text-sm"
              >
                {openEdit ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
