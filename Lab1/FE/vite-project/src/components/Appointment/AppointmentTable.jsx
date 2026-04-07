import { APPOINTMENT_STATUS_MAP } from "../../utils/appointmentConstants";

function AppointmentTable({ data = [], loading, onDelete, onEdit }) {
  // ==============================
  // FORMAT DATE
  // ==============================
  const formatDate = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return isNaN(d.getTime()) ? "Invalid" : d.toLocaleString();
  };

  return (
    <div
      className="bg-white rounded-xl border border-slate-200 p-4"
      style={{
        minHeight: "420px",   // 🔥 FIX CHÍNH
        maxHeight: "520px",
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
          Không có lịch hẹn nào
        </div>
      ) : (
        /* TABLE */
        <div className="overflow-x-auto h-full">
          <div className="max-h-full overflow-y-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold">Property</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold">Employee</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold">DateTime</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold">Notes</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {data.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                    {/* ID */}
                    <td className="px-4 py-3 font-medium">#{a.id}</td>

                    {/* CUSTOMER */}
                    <td className="px-4 py-3">
                      {a.customer?.name || "N/A"}
                    </td>

                    {/* PROPERTY */}
                    <td className="px-4 py-3">
                      {a.property?.title || "N/A"}
                    </td>

                    {/* EMPLOYEE */}
                    <td className="px-4 py-3">
                      {a.employee?.name || "N/A"}
                    </td>

                    {/* DATETIME */}
                    <td className="px-4 py-3">
                      {formatDate(a.dateTime)}
                    </td>

                    {/* CREATED */}
                    <td className="px-4 py-3">
                      {formatDate(a.createdDate)}
                    </td>

                    {/* STATUS */}
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          a.status === 0
                            ? "bg-blue-100 text-blue-800"
                            : a.status === 1
                            ? "bg-green-100 text-green-800"
                            : a.status === 2
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {APPOINTMENT_STATUS_MAP[a.status] || "Unknown"}
                      </span>
                    </td>

                    {/* NOTES */}
                    <td className="px-4 py-3 max-w-[200px] truncate">
                      {a.notes || "-"}
                    </td>

                    {/* ACTIONS */}
                    <td className="px-4 py-3 space-x-2">
                      <button
                        onClick={() => onEdit(a)}
                        className="px-2 py-1 bg-amber-100 text-amber-700 rounded hover:bg-amber-200 transition"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => onDelete(a.id)}
                        className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                      >
                        Delete
                      </button>
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

export default AppointmentTable;