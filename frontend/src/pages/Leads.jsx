import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchLeads,
  createLead,
  deleteLead,
  updateLead,
} from "../features/leadSlice";

const Leads = () => {
  const dispatch = useDispatch();
  const {
    list: leads = [],
    loading,
    error,
  } = useSelector((state) => state.leads);
  const { user } = useSelector((state) => state.auth); // user: { id, name, role, teamId }

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  const [leadForm, setLeadForm] = useState({
    name: "",
    email: "",
    phone: "",
    stage: "new",
  });

  useEffect(() => {
    dispatch(fetchLeads());
  }, [dispatch]);

  const handleChange = (e) => {
    setLeadForm({ ...leadForm, [e.target.name]: e.target.value });
  };

  const handleAddLead = async (e) => {
    e.preventDefault();
    if (!user) return alert("User not authenticated.");
    const newLead = {
      ...leadForm,
      ownerId: user.id,
      teamId: user.teamId,
      ownerName: user.name,
    };
    await dispatch(createLead(newLead));
    setLeadForm({ name: "", email: "", phone: "", stage: "new" });
    setIsAddModalOpen(false);
  };

  const handleDeleteLead = (lead) => {
    if (!user) return alert("User not authenticated.");

    const role = user.role?.toLowerCase();
    const canDelete =
      role === "admin" ||
      (role === "manager" && lead.teamId === user.teamId) ||
      (role === "sales" && lead.ownerId === user.id);

    if (!canDelete)
      return alert("You don’t have permission to delete this lead.");
    if (window.confirm("Are you sure you want to delete this lead?")) {
      dispatch(deleteLead(lead.id));
    }
  };

  const handleEditLead = (lead) => {
    if (!user) return alert("User not authenticated.");

    const role = user.role?.toLowerCase();
    const canEdit =
      role === "admin" ||
      (role === "manager" && lead.teamId === user.teamId) ||
      (role === "sales" && lead.ownerId === user.id);

    if (!canEdit) return alert("You don’t have permission to edit this lead.");

    setSelectedLead(lead);
    setLeadForm({
      name: lead.name,
      email: lead.email || "",
      phone: lead.phone || "",
      stage: lead.stage || "new",
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateLead = async (e) => {
    e.preventDefault();
    await dispatch(updateLead({ id: selectedLead.id, updates: leadForm }));
    setIsEditModalOpen(false);
    setSelectedLead(null);
  };

  // ✅ Reliable filtering
  const filteredLeads = useMemo(() => {
    if (!user || !user.role) return [];
    const role = user.role.toLowerCase();
    console.log("Filtering leads for role:", role);

    if (role === "admin") return leads;
    if (role === "manager")
      return leads.filter((lead) => lead.teamId === user.teamId);
    if (role === "sales")
      return leads.filter((lead) => lead.ownerId === user.id);
    return [];
  }, [leads, user]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-800">Leads</h1>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
          >
            + New Lead
          </button>
        </div>

        {loading && <p className="text-gray-600">Loading leads...</p>}
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {!loading && filteredLeads.length === 0 && (
          <p className="text-gray-500 italic">
            No leads available for your role.
          </p>
        )}

        {!loading && filteredLeads.length > 0 && (
          <div className="overflow-x-auto bg-white shadow-md rounded-xl">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Stage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-800 font-medium">
                      {lead.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {lead.email || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {lead.phone || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          lead.stage === "new"
                            ? "bg-blue-100 text-blue-700"
                            : lead.stage === "qualified"
                            ? "bg-green-100 text-green-700"
                            : lead.stage === "contacted"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {lead.stage}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {lead.ownerName || "Unassigned"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-4">
                      <button
                        onClick={() => handleEditLead(lead)}
                        className="text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteLead(lead)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isAddModalOpen && (
        <Modal
          title="Add New Lead"
          form={leadForm}
          onChange={handleChange}
          onSubmit={handleAddLead}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}

      {isEditModalOpen && (
        <Modal
          title="Edit Lead"
          form={leadForm}
          onChange={handleChange}
          onSubmit={handleUpdateLead}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </div>
  );
};

/* =======================================================
   Modal
======================================================= */
const Modal = ({ title, form, onChange, onSubmit, onClose }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
    <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">{title}</h2>
      <form onSubmit={onSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={onChange}
          className="w-full border border-gray-300 p-3 rounded-md mb-3 focus:ring focus:ring-indigo-200"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={form.email}
          onChange={onChange}
          className="w-full border border-gray-300 p-3 rounded-md mb-3 focus:ring focus:ring-indigo-200"
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={form.phone}
          onChange={onChange}
          className="w-full border border-gray-300 p-3 rounded-md mb-3 focus:ring focus:ring-indigo-200"
        />
        <select
          name="stage"
          value={form.stage}
          onChange={onChange}
          className="w-full border border-gray-300 p-3 rounded-md mb-4 focus:ring focus:ring-indigo-200"
        >
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="closed">Closed</option>
        </select>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition"
          >
            Save
          </button>
        </div>
      </form>

      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-lg"
      >
        ×
      </button>
    </div>
  </div>
);

export default Leads;
