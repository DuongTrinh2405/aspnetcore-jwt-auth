import { useEffect, useState } from "react";
import Loading from "../components/common/Loading";
import dashboardService from "../services/dashboardService";

// 🔥 thêm chart
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function Dashboard() {
  const [stats, setStats] = useState({
    customers: 0,
    deals: 0,
    properties: 0,
    totalRevenue: 0,
    totalWonRevenue: 0,
  });
  const [monthlyReport, setMonthlyReport] = useState([]);
  const [statusSummary, setStatusSummary] = useState([]);
  const [recentDeals, setRecentDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboard = async () => {
      try {
        setLoading(true);

        const dashboard = await dashboardService.getDashboard();

        if (!isMounted) return;

        setStats({
          customers: dashboard.customers ?? 0,
          deals: dashboard.deals ?? 0,
          properties: dashboard.properties ?? 0,
          totalRevenue: dashboard.totalRevenue ?? 0,
          totalWonRevenue: dashboard.totalWonRevenue ?? 0,
        });

        setMonthlyReport(dashboard.monthlyReport ?? []);
        setStatusSummary(dashboard.statusSummary ?? []);
        setRecentDeals(dashboard.recentDeals ?? []);
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
    <div className="app-page dashboard-page min-h-screen">
      
      {/* HEADER */}
      <div className="mb-8 rounded-[1.75rem] border border-white/80 bg-white/80 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <ReportCard title="Total Revenue" value={formatCurrency(stats.totalRevenue)} icon="💵" color="green" subtitle="Toàn bộ doanh thu deals" />
        <ReportCard title="Won Revenue" value={formatCurrency(stats.totalWonRevenue)} icon="🏆" color="purple" subtitle="Doanh thu deals thành công" />
        <ReportCard title="Status Summary" value={statusSummary.reduce((sum, item) => sum + item.count, 0)} icon="📊" color="blue" subtitle="Tình trạng deals hiện tại" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-3">Revenue Trend</h3>
          <p className="text-slate-500 text-sm mb-5">Xem doanh thu theo tháng của người dùng hiện tại.</p>

          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={monthlyReport.length ? monthlyReport : mockChart} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-3">Deal Status</h3>
          <p className="text-slate-500 text-sm mb-5">Tổng quan trạng thái deals hiện tại.</p>

          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={statusSummary} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#22c55e" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-3">Monthly Report</h3>
          <p className="text-slate-500 text-sm mb-5">Số liệu theo tháng cho Admin/Staff.</p>

          {!monthlyReport.length ? (
            <p className="text-gray-400 text-center py-10">Không có dữ liệu báo cáo tháng</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                  <tr>
                    <th className="py-3 px-2 text-left">Month</th>
                    <th className="text-right">Deals</th>
                    <th className="text-right">Revenue</th>
                    <th className="text-right">Won Deals</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {monthlyReport.map((item) => (
                    <tr key={item.month} className="hover:bg-slate-50 transition-colors duration-150">
                      <td className="py-3 px-2 font-medium text-slate-700">{item.month}</td>
                      <td className="py-3 px-2 text-right text-slate-600">{item.deals}</td>
                      <td className="py-3 px-2 text-right font-semibold text-slate-800">{formatCurrency(item.revenue)}</td>
                      <td className="py-3 px-2 text-right text-slate-600">{item.wonDeals}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-3">Recent Deals</h3>
          <p className="text-slate-500 text-sm mb-5">Danh sách deal mới nhất theo quyền hiện tại.</p>

          {!recentDeals.length ? (
            <p className="text-gray-400 text-center py-10">No recent deals</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                  <tr>
                    <th className="py-3 px-2">ID</th>
                    <th>Customer</th>
                    <th className="text-right">Price</th>
                    <th className="text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentDeals.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50 transition-colors duration-150">
                      <td className="py-3 px-2 font-medium text-slate-700">#{d.id}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-600">
                            {(d.customerName || "N")[0]}
                          </div>
                          {d.customerName || "N/A"}
                        </div>
                      </td>
                      <td className="text-right font-semibold">{formatCurrency(d.amount)}</td>
                      <td className="text-right">
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
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm transition duration-200 hover:shadow-lg hover:-translate-y-0.5">
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

function ReportCard({ title, value, icon, color = "blue", subtitle }) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm transition duration-200 hover:shadow-lg hover:-translate-y-0.5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-slate-500 text-sm">{title}</p>
          <h2 className="text-3xl font-bold text-slate-800 mt-1">{value}</h2>
          <p className="text-slate-400 text-xs mt-2">{subtitle}</p>
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

  let style = "inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full tracking-wide ";

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
  { month: "Jan", revenue: 3200 },
  { month: "Feb", revenue: 5100 },
  { month: "Mar", revenue: 4300 },
  { month: "Apr", revenue: 6200 },
  { month: "May", revenue: 5400 },
  { month: "Jun", revenue: 7100 },
];
