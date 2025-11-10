import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchDeals,
  createDeal,
  updateDeal,
  updateDealStage,
  deleteDeal,
  selectAllDeals,
  selectDealsLoading,
} from "../features/dealSlice";
import {
  fetchContacts,
  selectAllContacts,
  selectContactsLoading,
} from "../features/contactSlice";
import { Plus, Pencil, Trash2, DollarSign, User } from "lucide-react";

/* =========================================================
   📘 Deals Management Component
========================================================= */
export default function Deals() {
  const dispatch = useDispatch();

  // Redux State
  const deals = useSelector(selectAllDeals);
  const dealsLoading = useSelector(selectDealsLoading);
  const contacts = useSelector(selectAllContacts);
  const contactsLoading = useSelector(selectContactsLoading);

  // Local State
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [draggedDeal, setDraggedDeal] = useState(null);

  const [form, setForm] = useState({
    title: "",
    value: "",
    stage: "Lead",
    contactid: "",
    description: "",
  });

  const dealStages = [
    "Lead",
    "Qualified",
    "Proposal",
    "Negotiation",
    "Closed_Won",
    "Closed_Lost",
  ];

  /* =========================================================
     🔄 Fetch Deals & Contacts
  ========================================================= */
  useEffect(() => {
    dispatch(fetchDeals());
    dispatch(fetchContacts());
  }, [dispatch]);

  /* =========================================================
     ✏️ Form Handlers
  ========================================================= */
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = (e) => {
    e.preventDefault();
    dispatch(
      createDeal({
        title: form.title,
        value: Number(form.value),
        stage: form.stage,
        contactId: form.contactid || null,
        description: form.description || "",
      })
    );
    setForm({
      title: "",
      value: "",
      stage: "Lead",
      contactid: "",
      description: "",
    });
    setOpenCreate(false);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!selectedDeal) return;
    dispatch(updateDeal({ id: selectedDeal.id, data: form }));
    setOpenEdit(false);
    setSelectedDeal(null);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this deal?")) {
      dispatch(deleteDeal(id));
    }
  };

  const handleDragStart = (deal) => setDraggedDeal(deal);
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (stage) => {
    if (draggedDeal && draggedDeal.stage !== stage) {
      dispatch(updateDealStage({ id: draggedDeal.id, stage }));
    }
    setDraggedDeal(null);
  };

  const getDealsByStage = (stage) =>
    deals?.filter((d) => d.stage === stage) || [];

  const getStageTotal = (stage) =>
    getDealsByStage(stage).reduce((sum, d) => sum + d.value, 0);

  const getContactName = (contactId) => {
    const contact = contacts.find((c) => c.id === contactId);
    return contact ? contact.name : "—";
  };

  /* =========================================================
     🧭 Render
  ========================================================= */
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Deals Pipeline
          </h1>
          <p className="text-sm text-gray-500">
            Manage your opportunities and track progress
          </p>
        </div>
        <button
          onClick={() => setOpenCreate(true)}
          className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-md transition"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Deal
        </button>
      </div>

      {/* Loading */}
      {(dealsLoading || contactsLoading) && (
        <div className="flex gap-4 overflow-x-auto">
          {Array(5)
            .fill()
            .map((_, i) => (
              <div
                key={i}
                className="w-72 h-96 bg-white border rounded-lg animate-pulse"
              ></div>
            ))}
        </div>
      )}

      {/* Pipeline View */}
      {!dealsLoading && deals.length > 0 && (
        <div className="flex gap-4 overflow-x-auto pb-6">
          {dealStages.map((stage) => {
            const stageDeals = getDealsByStage(stage);
            const total = getStageTotal(stage);

            return (
              <div
                key={stage}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(stage)}
                className="shrink-0 w-72 bg-white rounded-lg border shadow-sm"
              >
                <div className="flex justify-between items-center px-4 py-3 border-b">
                  <h3 className="text-sm font-semibold text-gray-700">
                    {stage} ({stageDeals.length})
                  </h3>
                  <span className="text-xs text-gray-500">
                    ${total.toLocaleString()}
                  </span>
                </div>

                <div className="p-3 min-h-[400px] space-y-3">
                  {stageDeals.length > 0 ? (
                    stageDeals.map((deal) => (
                      <div
                        key={deal.id}
                        draggable
                        onDragStart={() => handleDragStart(deal)}
                        className="bg-gray-50 border rounded-md p-3 shadow-sm hover:shadow-md cursor-move transition"
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-gray-800 truncate">
                            {deal.title}
                          </h4>
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                setSelectedDeal(deal);
                                setForm({
                                  title: deal.title,
                                  value: deal.value,
                                  stage: deal.stage,
                                  contactid: deal.contactid || "",
                                  description: deal.description || "",
                                });
                                setOpenEdit(true);
                              }}
                              className="text-gray-500 hover:text-indigo-600"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(deal.id)}
                              className="text-gray-500 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-indigo-600 font-semibold mt-1">
                          ${deal.value.toLocaleString()}
                        </p>
                        {deal.contactid && (
                          <p className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                            <User className="w-3 h-3 text-gray-400" />
                            {getContactName(deal.contactid)}
                          </p>
                        )}
                        {deal.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {deal.description}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-sm text-gray-400 mt-4">
                      No deals
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!dealsLoading && deals.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center py-16 bg-white border rounded-lg">
          <DollarSign className="w-14 h-14 text-gray-400 mb-3" />
          <h3 className="text-lg font-semibold text-gray-700">No deals yet</h3>
          <p className="text-sm text-gray-500 mb-4">
            Start by adding your first deal
          </p>
          <button
            onClick={() => setOpenCreate(true)}
            className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-sm rounded-md"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Deal
          </button>
        </div>
      )}

      {/* =========================================================
          🟢 Create Deal Modal
      ========================================================= */}
      {openCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3">
          <div className="bg-white w-full max-w-md rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold">Create New Deal</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Deal Title"
                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
              <input
                name="value"
                type="number"
                value={form.value}
                onChange={handleChange}
                placeholder="Value ($)"
                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
              <select
                name="stage"
                value={form.stage}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {dealStages.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <select
                name="contactid"
                value={form.contactid}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">Select Contact (optional)</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.company ? `– ${c.company}` : ""}
                  </option>
                ))}
              </select>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Description (optional)"
                className="w-full border rounded-md px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setOpenCreate(false)}
                  className="px-4 py-2 border rounded-md text-sm hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          ✏️ Edit Deal Modal
      ========================================================= */}
      {openEdit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3">
          <div className="bg-white w-full max-w-md rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold">Edit Deal</h2>
            <form onSubmit={handleEditSubmit} className="space-y-3">
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
              <input
                name="value"
                type="number"
                value={form.value}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
              <select
                name="stage"
                value={form.stage}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {dealStages.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <select
                name="contactid"
                value={form.contactid}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">Select Contact (optional)</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full border rounded-md px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setOpenEdit(false)}
                  className="px-4 py-2 border rounded-md text-sm hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
