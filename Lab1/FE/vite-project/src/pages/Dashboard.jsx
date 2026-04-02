import { useEffect, useState } from "react";
import Loading from "../components/common/Loading";

import customerService from "../services/customerService";
import dealService from "../services/dealService";
import propertyService from "../services/propertyService";

// 🔥 thêm chart
import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function Dashboard() {
  const [stats, setStats] = useState({
    customers: 0,
    deals: 0,
    properties: 0,
  });
  const [recentDeals, setRecentDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboard = async () => {
      try {
        setLoading(true);

        const [customers, deals, properties] = await Promise.all([
          customerService.getCustomers(),
          dealService.getDeals(),
          propertyService.getProperties(),
        ]);

        if (!isMounted) return;

        setStats({
          customers: customers?.length ?? 0,
          deals: deals?.length ?? 0,
          properties: properties?.length ?? 0,
        });

        const sortedDeals = [...(deals || [])].sort((a, b) => {
          return new Date(b.createdDate || b.createdAt || 0)
            - new Date(a.createdDate || a.createdAt || 0);
        });

        setRecentDeals(sortedDeals.slice(0, 5));
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) return <Loading fullScreen />;

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Dashboard
        </h1>
        <p className="text-slate-500 text-sm">
          Welcome back 👋 Here's what's happening today
        </p>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Customers" value={stats.customers} icon="👥" color="blue" />
        <StatCard title="Deals" value={stats.deals} icon="💰" color="green" />
        <StatCard title="Properties" value={stats.properties} icon="🏠" color="purple" />
      </div>

      {/* CHART + ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* CHART */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow border">
          <h3 className="font-semibold text-slate-700 mb-4">
            Revenue Overview
          </h3>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={mockChart}>
              <XAxis dataKey="name" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ACTIVITY */}
        <div className="bg-white p-6 rounded-2xl shadow border">
          <h3 className="font-semibold mb-4 text-slate-700">
            Recent Activity
          </h3>

          <div className="space-y-4">
            {mockActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-bold">
                  {item.name[0]}
                </div>
                <div className="text-sm">
                  <p className="text-slate-700">{item.text}</p>
                  <p className="text-xs text-slate-400">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow border p-6">
        <h3 className="font-semibold text-slate-700 mb-4">
          Recent Deals
        </h3>

        {!recentDeals.length ? (
          <p className="text-gray-400 text-center py-10">
            No recent deals
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>
                  <th className="py-3 px-2">ID</th>
                  <th>Customer</th>
                  <th>Price</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {recentDeals.map((d) => (
                  <tr
                    key={d.id}
                    className="hover:bg-slate-50 transition"
                  >
                    <td className="py-3 px-2 font-medium">
                      #{d.id}
                    </td>

                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-600">
                          {(d.customerName || "N")[0]}
                        </div>
                        {d.customerName ||
                          d.customer?.name ||
                          d.customer?.fullName ||
                          "N/A"}
                      </div>
                    </td>

                    <td className="font-semibold text-slate-800">
                      {formatCurrency(d.price ?? d.amount)}
                    </td>

                    <td>
                      <StatusBadge status={d.status} />
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;

//
// COMPONENTS
//

function StatCard({ title, value, icon, color = "blue" }) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
  };

  return (
    <div className="bg-white rounded-2xl shadow border p-6 hover:shadow-xl transition hover:scale-[1.02]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-500 text-sm">{title}</p>
          <h2 className="text-3xl font-bold text-slate-800">
            {value}
          </h2>
        </div>

        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${colorClasses[color]} flex items-center justify-center text-white text-xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const s = String(status ?? "").toLowerCase();

  let style = "px-2 py-1 text-xs font-medium rounded-md ";

  if (s === "completed" || s === "won") {
    style += "bg-green-100 text-green-600";
  } else if (s === "pending") {
    style += "bg-yellow-100 text-yellow-600";
  } else if (s === "cancelled" || s === "lost") {
    style += "bg-red-100 text-red-600";
  } else {
    style += "bg-gray-200 text-gray-600";
  }

  return <span className={style}>{status ?? "Unknown"}</span>;
}

//
// HELPERS
//

const formatCurrency = (value) => {
  if (value === null || value === undefined) return "$0";
  const num = Number(value);
  if (isNaN(num)) return "$0";

  return num.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
};

//
// MOCK DATA (cho đẹp UI)
//

const mockChart = [
  { name: "Mon", value: 400 },
  { name: "Tue", value: 800 },
  { name: "Wed", value: 600 },
  { name: "Thu", value: 1200 },
  { name: "Fri", value: 900 },
];

const mockActivity = [
  { name: "John", text: "Created new deal", time: "2 mins ago" },
  { name: "Anna", text: "Closed deal $1200", time: "10 mins ago" },
  { name: "Mike", text: "Updated property", time: "1 hour ago" },
];