import { useState } from "react";
import {
  getDealStageLabel,
  getDealStatusLabel,
} from "../../utils/dealConstants";

function DealTable({
  data = [],
  customers = [],
  loading,
  onClose,
  onDelete,
  onEdit,
  isAdmin, // ✅ thêm role
}) {
  const [selectedProperty, setSelectedProperty] = useState(null);

  const getCustomerName = (deal) => {
    if (deal.customerName) return deal.customerName;

    const c = Array.isArray(customers)
      ? customers.find((c) => c.id === deal.customerId)
      : null;

    return c?.name || `Customer #${deal.customerId}`;
  };

  const formatAmount = (amount) => {
    if (!amount && amount !== 0) return "0 đ";
    return Number(amount).toLocaleString() + " đ";
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("vi-VN");
  };

  return (
    <>
      {/* CONTAINER */}
      <div
        className="bg-white rounded-xl border border-slate-200 p-4"
        style={{
          minHeight: "420px",
          maxHeight: "520px",
          overflow: "hidden",
        }}
      >
        {/* LOADING */}
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-slate-600">
              Đang tải dữ liệu...
            </span>
          </div>
        ) : !data.length ? (
          /* EMPTY */
          <div className="flex items-center justify-center h-full text-slate-500">
            Không có giao dịch nào
          </div>
        ) : (
          /* TABLE */
          <div className="overflow-x-auto h-full">
            <div className="max-h-full overflow-y-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold">
                      Deal ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold">
                      Property
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold">
                      Created
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold">
                      Closed
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold">
                      Stage
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {data.map((d) => {
                    const isClosed = d.status === 2 || d.status === 3;

                    return (
                      <tr key={d.id} className="hover:bg-slate-50">
                        {/* ID */}
                        <td className="px-6 py-4">#{d.id}</td>

                        {/* PROPERTY */}
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">
                            {d.propertyTitle || d.title}
                          </div>

                          <div
                            onClick={() => setSelectedProperty(d)}
                            className="text-xs text-blue-500 cursor-pointer hover:underline"
                          >
                            Property ID: {d.propertyId || "-"}
                          </div>
                        </td>

                        {/* PRICE */}
                        <td className="px-6 py-4 font-bold text-blue-600">
                          {formatAmount(d.amount)}
                        </td>

                        {/* CUSTOMER */}
                        <td className="px-6 py-4">
                          {getCustomerName(d)}
                        </td>

                        {/* CREATED */}
                        <td className="px-6 py-4">
                          {formatDate(d.createdDate)}
                        </td>

                        {/* CLOSED */}
                        <td className="px-6 py-4">
                          {formatDate(d.closedDate)}
                        </td>

                        {/* STAGE */}
                        <td className="px-6 py-4">
                          {getDealStageLabel(d.stage)}
                        </td>

                        {/* STATUS */}
                        <td className="px-6 py-4">
                          {getDealStatusLabel(d.status)}
                        </td>

                        {/* ACTIONS */}
                        <td className="px-6 py-4 space-x-2">
                          {!isAdmin && (
                            <>
                              {/* EDIT */}
                              <button
                                onClick={() => !isClosed && onEdit(d)}
                                disabled={isClosed}
                                className="px-3 py-1 bg-amber-50 text-amber-700 rounded-md hover:bg-amber-100 disabled:opacity-50"
                              >
                                Edit
                              </button>

                              {/* CLOSE */}
                              {!isClosed && (
                                <button
                                  onClick={() => onClose(d)}
                                  className="px-3 py-1 bg-green-50 text-green-700 rounded-md hover:bg-green-100"
                                >
                                  Close
                                </button>
                              )}

                              {/* DELETE */}
                              <button
                                onClick={() => onDelete(d.id)}
                                className="px-3 py-1 bg-red-50 text-red-700 rounded-md hover:bg-red-100"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL PROPERTY */}
      {selectedProperty && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-md p-5 w-[360px]">
            <h2 className="text-base font-semibold mb-3">
              Property Detail
            </h2>

            <div className="space-y-1 text-sm text-slate-700">
              <p><b>ID:</b> {selectedProperty.propertyId}</p>
              <p><b>Title:</b> {selectedProperty.propertyTitle}</p>
              <p><b>Price:</b> {formatAmount(selectedProperty.amount)}</p>
              <p><b>Customer:</b> {getCustomerName(selectedProperty)}</p>
              <p><b>Created:</b> {formatDate(selectedProperty.createdDate)}</p>
              <p><b>Closed:</b> {formatDate(selectedProperty.closedDate)}</p>
            </div>

            <div className="mt-4">
              <button
                onClick={() => setSelectedProperty(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DealTable;