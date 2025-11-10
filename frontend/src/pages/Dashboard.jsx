import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDashboard,
  selectDashboardLoading,
  selectDashboardError,
  selectDashboardStats,
  dealsSelectors,
  tasksSelectors,
} from "../features/dashboardSlice";
import { fetchAnalyticsOverview } from "../features/analyticsSlice";
import {
  Users,
  DollarSign,
  CheckSquare,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  BarChart,
} from "recharts";

/* =========================================================
   📊 Unified Production Dashboard
========================================================= */
export default function Dashboard() {
  const dispatch = useDispatch();

  const {
    summary,
    dealsByStage,
    topPerformers,
    recentHistories,
    loading: analyticsLoading,
    error: analyticsError,
  } = useSelector((state) => state.analytics);

  const auth = useSelector((state) => state.auth);
  const role = auth?.user?.role?.toUpperCase() || "SALES";

  const dashLoading = useSelector(selectDashboardLoading);
  const dashError = useSelector(selectDashboardError);
  const stats = useSelector(selectDashboardStats);
  const deals = useSelector((state) => dealsSelectors.selectAll(state));
  const tasks = useSelector((state) => tasksSelectors.selectAll(state));

  const isLoading = dashLoading === "pending" || analyticsLoading;

  /* -------------------------------
     Fetch Dashboard + Analytics
  ------------------------------- */
  useEffect(() => {
    dispatch(fetchDashboard());
    dispatch(fetchAnalyticsOverview());
  }, [dispatch]);
  /* -------------------------------
   Role-Based Filters
------------------------------- */
  const filteredPerformers = useMemo(() => {
    if (!topPerformers?.length) return [];
    if (role === "ADMIN") return topPerformers;
    if (role === "MANAGER")
      return topPerformers.filter(
        (p) => p.user?.role === "SALES" || p.user?.managerId === auth.user?.id
      );
    return topPerformers.filter((p) => p.ownerId === auth.user?.id);
  }, [role, topPerformers, auth.user]);

  const filteredHistories = useMemo(() => {
    if (!recentHistories?.length) return [];
    if (role === "ADMIN") return recentHistories;
    if (role === "MANAGER")
      return recentHistories.filter(
        (h) => h.user?.role === "SALES" || h.user?.managerId === auth.user?.id
      );
    return recentHistories.filter((h) => h.user?.id === auth.user?.id);
  }, [role, recentHistories, auth.user]);

  /* -------------------------------
   Normalize Data for Display
------------------------------- */
  const normalizedDealsByStage = useMemo(() => {
    if (!dealsByStage?.length) return [];
    return dealsByStage.map((s) => ({
      stage: s.stage || s.dealstage || "Unknown",
      count: s._count?.stage ?? s._count?.id ?? s.count ?? 0,
    }));
  }, [dealsByStage]);

  const normalizedPerformers = useMemo(() => {
    if (!filteredPerformers?.length) return [];
    return filteredPerformers.map((p) => ({
      name: p.user?.name ?? p.name ?? "—",
      email: p.user?.email ?? p.email ?? "—",
      deals: p._count?.id ?? p.count ?? 0,
    }));
  }, [filteredPerformers]);

  /* -------------------------------
     Error + Loading States
  ------------------------------- */
  if (dashError || analyticsError) {
    const errMsg =
      dashError?.message ||
      analyticsError?.message ||
      "Failed to load dashboard";
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <p className="text-lg text-red-600 mb-2">{errMsg}</p>
        <button
          onClick={() => {
            dispatch(fetchDashboard());
            dispatch(fetchAnalyticsOverview());
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-600 text-lg">
        Loading dashboard...
      </div>
    );

  /* =========================================================
     🧭 UI Layout
  ========================================================= */
  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-10">
      {/* Header */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800">
            {role === "ADMIN"
              ? "Admin Analytics Dashboard"
              : role === "MANAGER"
              ? "Team Dashboard"
              : "My Dashboard"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Viewing as <span className="font-medium">{role}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition">
            Activity Feed
          </button>
          <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition">
            deals
          </button>
        </div>
      </header>

      {/* Metrics */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <MetricCard title="Contacts" value={stats.totalContacts} icon={Users} />
        <MetricCard
          title="Active deals"
          value={stats.activedeals}
          icon={DollarSign}
        />
        <MetricCard
          title="Pipeline"
          value={`$${stats.pipeline.toLocaleString()}`}
          icon={TrendingUp}
        />
        <MetricCard
          title="Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
        />
        <MetricCard
          title="Pending Tasks"
          value={stats.pendingTasks}
          icon={CheckSquare}
        />
        <MetricCard
          title="Win Rate"
          value={`${stats.conversionRate}%`}
          icon={BarChart3}
        />
      </section>

      {/* Summary */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <SummaryCard
          title="Total deals"
          value={summary?.totaldeals ?? 0}
          color="indigo"
        />
        {role === "ADMIN" && (
          <SummaryCard
            title="Total Users"
            value={summary?.totalUsers ?? 0}
            color="blue"
          />
        )}
        <SummaryCard
          title="Activities"
          value={summary?.totalActivities ?? 0}
          color="emerald"
        />
        <SummaryCard
          title="Histories"
          value={summary?.totalHistories ?? 0}
          color="rose"
        />
      </section>

      {/* Charts & Tables */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Deals by Stage" data={normalizedDealsByStage} />

        <TeamTable
          title={role === "ADMIN" ? "Top Performers" : "Team Performance"}
          data={normalizedPerformers}
        />
      </section>

      {/* Recent Activities */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityList deals={deals} />
        <TaskList tasks={tasks} />
      </section>

      {/* Recent Lead Changes */}
      <section className="bg-white shadow rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Recent Lead Changes
        </h2>
        {!filteredHistories.length ? (
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
}

/* =========================================================
   🧩 Subcomponents
========================================================= */

const MetricCard = ({ title, value, icon: Icon }) => (
  <div className="bg-white border rounded-xl p-5 text-center shadow-sm hover:shadow-md transition">
    <div className="flex justify-center mb-2">
      <Icon className="h-6 w-6 text-gray-600" />
    </div>
    <h4 className="text-sm font-medium text-gray-500">{title}</h4>
    <p className="text-2xl font-bold text-gray-800 mt-1">{value ?? 0}</p>
  </div>
);

const SummaryCard = ({ title, value, color }) => {
  const colorMap = {
    indigo: "bg-indigo-100 text-indigo-700 border-indigo-200",
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
    rose: "bg-rose-100 text-rose-700 border-rose-200",
  };
  return (
    <div
      className={`border rounded-xl p-5 text-center shadow-sm ${colorMap[color]}`}
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
          <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
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
            <th className="p-3 text-right">deals</th>
          </tr>
        </thead>
        <tbody>
          {data.map((p, idx) => (
            <tr key={idx} className="border-t hover:bg-gray-50">
              <td className="p-3">{p.name}</td>
              <td className="p-3">{p.email}</td>
              <td className="p-3 text-right">{p.deals}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);

const ActivityList = ({ deals }) => (
  <div className="bg-white shadow rounded-xl p-6">
    <h2 className="text-xl font-semibold text-gray-700 mb-4">Recent deals</h2>
    {!deals?.length ? (
      <p className="text-gray-500">No recent deals.</p>
    ) : (
      <div className="space-y-3">
        {deals.slice(0, 5).map((d) => (
          <div
            key={d.id}
            className="flex justify-between items-center border p-3 rounded-md hover:bg-gray-50"
          >
            <div>
              <p className="font-medium text-gray-800">{d.title}</p>
              <p className="text-sm text-gray-500">{d.stage}</p>
            </div>
            <p className="text-sm font-semibold text-gray-700">
              ${Number(d.value).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    )}
  </div>
);

const TaskList = ({ tasks }) => {
  const pending = tasks.filter(
    (t) => String(t.status).toLowerCase() !== "completed"
  );
  return (
    <div className="bg-white shadow rounded-xl p-6">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        Upcoming Tasks
      </h2>
      {!pending.length ? (
        <p className="text-gray-500">No pending tasks.</p>
      ) : (
        <div className="space-y-3">
          {pending.slice(0, 5).map((t) => (
            <div
              key={t.id}
              className="flex justify-between items-center border p-3 rounded-md hover:bg-gray-50"
            >
              <div>
                <p className="font-medium text-gray-800">{t.title}</p>
                <p className="text-sm text-gray-500">{t.priority} priority</p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">
                {t.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
