import { CUSTOMER_STATUS_MAP } from "../../utils/customerConstants";

const statusColor = {
  0: "bg-slate-100 text-slate-800",
  1: "bg-green-100 text-green-800",
  2: "bg-yellow-100 text-yellow-800",
  3: "bg-blue-100 text-blue-800",
  4: "bg-purple-100 text-purple-800",
  5: "bg-red-100 text-red-800",
};

function CustomerTable({
  data = [],
  loading,
  onEdit,
  onDelete,
  user,
  onViewEmployee,
}) {
  return (
    <div
      className="bg-white rounded-xl border border-slate-200 p-4"
      style={{
        minHeight: "420px",     // 🔥 FIX CHÍNH
        maxHeight: "520px",     // 🔥 tránh kéo dài vô hạn
        overflow: "hidden",
      }}
    >
      {/* LOADING */}
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-slate-600">Đang tải dữ liệu...</span>
        </div>
      ) : !data.length ? (
        /* EMPTY */
        <div className="flex items-center justify-center h-full text-slate-500">
          Không có khách hàng nào
        </div>
      ) : (
        /* TABLE */
        <div className="overflow-x-auto h-full">
          <div className="max-h-full overflow-y-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Phone</th>
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

                    {/* EMPLOYEE */}
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {item.employeeId ? (
                        <button
                          onClick={() => onViewEmployee(item.employeeId)}
                          className="text-blue-600 hover:underline"
                        >
                          {item.employeeName}
                        </button>
                      ) : (
                        "-"
                      )}
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          statusColor[item.status] || "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {CUSTOMER_STATUS_MAP[item.status] || "Unknown"}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-4 text-sm font-medium space-x-2">
                      {user?.role !== "Admin" ? (
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
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerTable;