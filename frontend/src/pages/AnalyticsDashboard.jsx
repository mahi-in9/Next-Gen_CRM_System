import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAnalyticsOverview } from "../features/analyticsSlice";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const AnalyticsDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    summary,
    leadsByStage,
    topPerformers,
    recentHistories,
    loading,
    error,
  } = useSelector((state) => state.analytics);

  const { user } = useSelector((state) => state.auth) || {};
  const role = user?.role?.toUpperCase() || "SALES";

  useEffect(() => {
    dispatch(fetchAnalyticsOverview());
  }, [dispatch]);

  /* =========================================================
     📊 Role-Based Data Filtering
  ========================================================= */
  const filteredPerformers = useMemo(() => {
    if (!topPerformers?.length) return [];
    if (role === "ADMIN") return topPerformers;
    if (role === "MANAGER")
      return topPerformers.filter(
        (p) => p.user?.role === "SALES" || p.user?.managerId === user?.id
      );
    return topPerformers.filter((p) => p.ownerId === user?.id);
  }, [role, topPerformers, user]);

  const filteredHistories = useMemo(() => {
    if (!recentHistories?.length) return [];
    if (role === "ADMIN") return recentHistories;
    if (role === "MANAGER")
      return recentHistories.filter(
        (h) => h.user?.role === "SALES" || h.user?.managerId === user?.id
      );
    return recentHistories.filter((h) => h.user?.id === user?.id);
  }, [role, recentHistories, user]);

  const filteredSummary = useMemo(() => {
    if (!summary) return {};
    if (role === "ADMIN") return summary;
    if (role === "MANAGER") {
      return {
        totalLeads: summary.totalLeads,
        totalActivities: summary.totalActivities,
        totalHistories: summary.totalHistories,
      };
    }
    // Sales
    return {
      totalLeads: summary.personalLeads ?? summary.totalLeads ?? 0,
      totalActivities:
        summary.personalActivities ?? summary.totalActivities ?? 0,
      totalHistories: summary.personalHistories ?? summary.totalHistories ?? 0,
    };
  }, [role, summary]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-600 text-lg">
        Loading analytics...
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-500 text-lg">
        {error}
      </div>
    );

  /* =========================================================
     🧭 UI by Role
  ========================================================= */
  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-10">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800">
            Analytics Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Viewing as <span className="font-medium">{role}</span>
          </p>
        </div>
        <nav className="flex space-x-4">
          <button
            onClick={() => navigate("/activities")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
          >
            Activity Feed
          </button>
          <button
            onClick={() => navigate("/leads")}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
          >
            Leads
          </button>
        </nav>
      </header>

      {/* ===================== Summary ===================== */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <SummaryCard
          title="Leads"
          value={filteredSummary.totalLeads}
          color="indigo"
        />
        {role === "ADMIN" && (
          <SummaryCard
            title="Total Users"
            value={summary.totalUsers}
            color="blue"
          />
        )}
        <SummaryCard
          title="Activities"
          value={filteredSummary.totalActivities}
          color="emerald"
        />
        <SummaryCard
          title="Histories"
          value={filteredSummary.totalHistories}
          color="rose"
        />
      </section>

      {/* ===================== ADMIN VIEW ===================== */}
      {role === "ADMIN" && (
        <section className="grid md:grid-cols-2 gap-6">
          <ChartCard title="Leads by Stage" data={leadsByStage} />
          <TeamTable data={filteredPerformers} title="Top Performers" />
        </section>
      )}

      {/* ===================== MANAGER VIEW ===================== */}
      {role === "MANAGER" && (
        <section className="grid md:grid-cols-2 gap-6">
          <ChartCard title="Team Leads by Stage" data={leadsByStage} />
          <TeamTable data={filteredPerformers} title="Team Performance" />
        </section>
      )}

      {/* ===================== SALES VIEW ===================== */}
      {role === "SALES" && (
        <section className="bg-white shadow rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            My Metrics
          </h2>
          <p className="text-gray-600">
            You can view your personal leads, activities, and recent updates
            below.
          </p>
        </section>
      )}

      {/* ===================== Recent Histories ===================== */}
      <section className="bg-white shadow rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          {role === "SALES" ? "My Recent Lead Changes" : "Recent Lead Changes"}
        </h2>
        {filteredHistories.length === 0 ? (
          <p className="text-gray-500">No recent changes found.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredHistories.map((h) => (
              <li key={h.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="text-gray-800">
                    <span className="font-semibold">{h.user?.name}</span>{" "}
                    updated <span className="font-medium">{h.lead?.name}</span>
                    ’s <span className="text-gray-600">{h.field}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    {h.oldValue} → {h.newValue}
                  </p>
                </div>
                <p className="text-xs text-gray-400">
                  {new Date(h.timeStamp).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default AnalyticsDashboard;

/* =========================================================
   🧩 Subcomponents
========================================================= */
const SummaryCard = ({ title, value, color }) => {
  const colorMap = {
    indigo: "bg-indigo-100 text-indigo-700 border-indigo-200",
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
    rose: "bg-rose-100 text-rose-700 border-rose-200",
  };
  return (
    <div
      className={`border rounded-xl p-5 text-center shadow-sm ${
        colorMap[color] || ""
      }`}
    >
      <h4 className="text-sm font-medium mb-1">{title}</h4>
      <p className="text-2xl font-bold">{value ?? 0}</p>
    </div>
  );
};

const ChartCard = ({ title, data }) => (
  <div className="bg-white shadow rounded-xl p-6">
    <h2 className="text-xl font-semibold text-gray-700 mb-4">{title}</h2>
    {!data?.length ? (
      <p className="text-gray-500">No data available</p>
    ) : (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="stage" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="_count.stage" fill="#6366f1" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    )}
  </div>
);

const TeamTable = ({ data, title }) => (
  <div className="bg-white shadow rounded-xl p-6 overflow-auto">
    <h2 className="text-xl font-semibold text-gray-700 mb-4">{title}</h2>
    {!data?.length ? (
      <p className="text-gray-500">No performance data</p>
    ) : (
      <table className="w-full text-sm text-left text-gray-700">
        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
          <tr>
            <th className="p-3">User</th>
            <th className="p-3">Email</th>
            <th className="p-3 text-right">Leads</th>
          </tr>
        </thead>
        <tbody>
          {data.map((p) => (
            <tr key={p.ownerId} className="border-t hover:bg-gray-50">
              <td className="p-3">{p.user?.name || "—"}</td>
              <td className="p-3">{p.user?.email || "—"}</td>
              <td className="p-3 text-right">{p._count.id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);
