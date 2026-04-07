import { useEffect, useMemo, useState } from "react";
import Loading from "../components/common/Loading";
import reportService from "../services/reportService";
import { getEmployees } from "../services/employeeService";
import { ROLES } from "../utils/constants";
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

function Reports() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user?.role === ROLES.ADMIN;

  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [reportData, setReportData] = useState({
    employeeName: "All employees",
    customers: 0,
    deals: 0,
    properties: 0,
    totalRevenue: 0,
    totalWonRevenue: 0,
    statusSummary: [],
    monthlyReport: [],
    recentDeals: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const employeeOptions = useMemo(() => {
    return [{ id: "all", name: "All employees" }, ...employees];
  }, [employees]);

  const fetchEmployees = async () => {
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (err) {
      console.error("Load employees error:", err);
    }
  };

  const fetchReport = async (employeeId) => {
    try {
      setLoading(true);
      setError("");

      const employeeQuery = employeeId === "all" ? undefined : employeeId;
      const report = await reportService.getReport(employeeQuery);

      setReportData({
        employeeName: report.employeeName || "All employees",
        customers: report.customers ?? 0,
        deals: report.deals ?? 0,
        properties: report.properties ?? 0,
        totalRevenue: report.totalRevenue ?? 0,
        totalWonRevenue: report.totalWonRevenue ?? 0,
        statusSummary: report.statusSummary ?? [],
        monthlyReport: report.monthlyReport ?? [],
        recentDeals: report.recentDeals ?? [],
      });
    } catch (err) {
      console.error("Report error:", err);
      setError(err?.message || "Không thể tải dữ liệu báo cáo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchEmployees();
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchReport(selectedEmployee);
  }, [selectedEmployee]);

  if (loading) return <Loading fullScreen />;

  return (
    <div className="app-page space-y-6 min-h-screen">
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Báo cáo doanh số</h1>
          <p className="text-slate-500">Xem báo cáo doanh thu, deals và hiệu suất nhân viên.</p>
        </div>

        {isAdmin ? (
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
            <label className="font-medium text-slate-700">Chọn nhân viên:</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="app-input"
            >
              {employeeOptions.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">Báo cáo của bạn</div>
            <div className="mt-2 text-lg font-semibold text-slate-900">{reportData.employeeName}</div>
          </div>
        )}
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <MetricCard title="Customers" value={reportData.customers} color="blue" />
        <MetricCard title="Deals" value={reportData.deals} color="green" />
        <MetricCard title="Properties" value={reportData.properties} color="purple" />
        <MetricCard title="Revenue" value={formatCurrency(reportData.totalRevenue)} color="emerald" />
        <MetricCard title="Won Revenue" value={formatCurrency(reportData.totalWonRevenue)} color="teal" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 app-card-soft p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reportData.monthlyReport.length ? reportData.monthlyReport : []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="app-card-soft p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Deal Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportData.statusSummary} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
              <XAxis dataKey="status" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#14b8a6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 app-card-soft p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Monthly Report</h3>

          {!reportData.monthlyReport.length ? (
            <p className="text-slate-500">Chưa có dữ liệu doanh thu tháng.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wide">
                  <tr>
                    <th className="p-3 text-left">Month</th>
                    <th className="p-3 text-right">Deals</th>
                    <th className="p-3 text-right">Revenue</th>
                    <th className="p-3 text-right">Won</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {reportData.monthlyReport.map((item) => (
                    <tr key={item.month} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-medium text-slate-700">{item.month}</td>
                      <td className="p-3 text-right text-slate-700">{item.deals}</td>
                      <td className="p-3 text-right font-semibold text-slate-900">{formatCurrency(item.revenue)}</td>
                      <td className="p-3 text-right text-slate-700">{item.wonDeals}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="app-card-soft p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Recent Deals</h3>

          {!reportData.recentDeals.length ? (
            <p className="text-slate-500">Không có deals mới.</p>
          ) : (
            <div className="space-y-4">
              {reportData.recentDeals.map((deal) => (
                <div key={deal.id} className="rounded-3xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-slate-800 font-semibold">Deal #{deal.id}</div>
                      <div className="text-slate-500 text-sm">{deal.customerName}</div>
                    </div>
                    <div className="text-slate-900 font-semibold">{formatCurrency(deal.amount)}</div>
                  </div>
                  <div className="mt-2 text-xs text-slate-500">Status: {deal.status}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Reports;

function MetricCard({ title, value, color }) {
  const colors = {
    blue: "from-blue-500 to-blue-600",
    green: "from-emerald-500 to-emerald-600",
    purple: "from-purple-500 to-purple-600",
    emerald: "from-emerald-500 to-emerald-600",
    teal: "from-teal-500 to-teal-600",
  };

  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <h3 className="mt-3 text-3xl font-semibold text-slate-900">{value}</h3>
      <div className={`mt-4 h-1 rounded-full bg-gradient-to-r ${colors[color] || colors.blue}`} />
    </div>
  );
}

const formatCurrency = (value) => {
  if (value === null || value === undefined) return "$0";
  const num = Number(value);
  if (isNaN(num)) return "$0";

  return num.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
};
