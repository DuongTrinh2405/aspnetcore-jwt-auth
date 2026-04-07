import { useMemo } from "react";
import Loading from "../common/Loading";

function EmployeeTable({ data = [], loading, onDelete, onEdit }) {

  // ==============================
  // 🔥 GET ROLE (SAFE)
  // ==============================
  const role = useMemo(() => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;

      const parts = token.split(".");
      if (parts.length !== 3) return null;

      const payload = JSON.parse(atob(parts[1]));

      return (
        payload["role"] ||
        payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
      );
    } catch {
      return null;
    }
  }, []);

  const isAdmin = role?.toLowerCase() === "admin";

  // ==============================
  // LOADING
  // ==============================
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-slate-600">Đang tải dữ liệu...</span>
      </div>
    );
  }

  // ==============================
  // EMPTY
  // ==============================
  if (!data.length) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
          />
        </svg>
        <p className="mt-4 text-slate-500">Không có nhân viên nào</p>
      </div>
    );
  }

  // ==============================
  // UTILS
  // ==============================
  const safe = (value) => {
    if (value === null || value === undefined || value === "") {
      return "N/A";
    }
    return value;
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return isNaN(d.getTime()) ? "Invalid" : d.toLocaleString();
  };

  // ==============================
  // RENDER
  // ==============================
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">#</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Name</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Email</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Phone</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Role</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Created</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-200">
          {data.map((e) => (
            <tr key={e.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                #{e.id}
              </td>

              <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                {safe(e.name)}
              </td>

              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                {safe(e.email)}
              </td>

              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                {safe(e.phone)}
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  {safe(e.role)}
                </span>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  {safe(e.status)}
                </span>
              </td>

              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                {formatDate(e.createdDate)}
              </td>

              {/* ✅ FIX KHÔNG DÙNG && */}
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                {onEdit ? (
                  <button
                    onClick={() => onEdit(e)}
                    className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                  >
                    Edit
                  </button>
                ) : null}

                {isAdmin ? (
                  <button
                    onClick={() => onDelete(e.id)}
                    className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EmployeeTable;