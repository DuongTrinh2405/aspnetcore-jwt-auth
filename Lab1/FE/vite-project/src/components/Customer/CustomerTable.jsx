import { CUSTOMER_STATUS_MAP } from "../../utils/customerConstants";

const statusColor = {
  0: "bg-slate-100 text-slate-800",
  1: "bg-green-100 text-green-800",
  2: "bg-yellow-100 text-yellow-800",
  3: "bg-blue-100 text-blue-800",
  4: "bg-purple-100 text-purple-800",
  5: "bg-red-100 text-red-800",
};

function CustomerTable({ data = [], loading, onEdit, onDelete, user }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-slate-600">Đang tải dữ liệu...</span>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <p className="mt-4 text-slate-500">Không có khách hàng nào</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">ID</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Name</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Email</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Phone</th>

            {/* 🔥 THÊM CỘT NHÂN VIÊN */}
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Nhân viên</th>

            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-200">
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50 transition-colors">

              <td className="px-6 py-4 text-sm font-medium text-slate-900">
                #{item.id}
              </td>

              <td className="px-6 py-4 text-sm text-slate-900">
                {item.name || "-"}
              </td>

              <td className="px-6 py-4 text-sm text-slate-700">
                {item.email || "-"}
              </td>

              <td className="px-6 py-4 text-sm text-slate-700">
                {item.phone || "-"}
              </td>

              {/* 🔥 HIỂN THỊ OWNER */}
              <td className="px-6 py-4 text-sm text-slate-700">
                {item.employeeName || "-"}
              </td>

              <td className="px-6 py-4">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    statusColor[item.status] || "bg-slate-100 text-slate-800"
                  }`}
                >
                  {CUSTOMER_STATUS_MAP[item.status] || "Unknown"}
                </span>
              </td>

              <td className="px-6 py-4 text-sm font-medium space-x-2">
                {/* 🔥 ẨN NÚT NẾU ADMIN */}
                {user?.role !== "Admin" && (
                  <>
                    <button
                      onClick={() => onEdit(item)}
                      className="inline-flex items-center px-3 py-1 rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100 transition"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => onDelete(item.id)}
                      className="inline-flex items-center px-3 py-1 rounded-md bg-red-50 text-red-700 hover:bg-red-100 transition"
                    >
                      Delete
                    </button>
                  </>
                )}
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CustomerTable;