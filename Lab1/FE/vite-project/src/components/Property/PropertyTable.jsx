import { useState } from "react";

const statusMap = {
  0: "Available",
  1: "Reserved",
  2: "Sold",
  3: "Rented",
  4: "Negotiation",
  5: "Off Market",
};

function PropertyTable({ data = [], loading, onEdit, onDelete }) {
  const [preview, setPreview] = useState(null);
  const [zoom, setZoom] = useState(false);

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
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
        <p className="mt-4 text-slate-500">Không có dữ liệu</p>
      </div>
    );
  }

  // ==============================
  // TABLE
  // ==============================
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">ID</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Image</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Title</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Price</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition">
                {/* ID */}
                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                  #{item.id}
                </td>

                {/* IMAGE */}
                <td className="px-6 py-4">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="w-20 h-16 object-cover rounded-lg cursor-pointer hover:opacity-80"
                      onClick={() => {
                        setPreview(item.imageUrl);
                        setZoom(false);
                      }}
                    />
                  ) : (
                    <div className="w-20 h-16 bg-slate-200 rounded-lg flex items-center justify-center">
                      <span className="text-xs text-slate-500">No Image</span>
                    </div>
                  )}
                </td>

                {/* TITLE */}
                <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                  {item.title}
                </td>

                {/* PRICE */}
                <td className="px-6 py-4 text-sm font-bold text-blue-600">
                  {Number(item.price || 0).toLocaleString()} đ
                </td>

                {/* STATUS */}
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                      item.status === 0
                        ? "bg-blue-100 text-blue-800"
                        : item.status === 1
                        ? "bg-amber-100 text-amber-800"
                        : item.status === 2
                        ? "bg-green-100 text-green-800"
                        : item.status === 3
                        ? "bg-indigo-100 text-indigo-800"
                        : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    {statusMap[item.status] || "Unknown"}
                  </span>
                </td>

                {/* ACTION */}
                <td className="px-6 py-4 space-x-2">
                  <button
                    onClick={() => onEdit(item)}
                    className="px-3 py-1 text-sm rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => onDelete(item.id)}
                    className="px-3 py-1 text-sm rounded-md bg-red-50 text-red-700 hover:bg-red-100"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* IMAGE PREVIEW */}
      {preview && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          onClick={() => setPreview(null)}
        >
          <img
            src={preview}
            alt=""
            className={`max-w-[85vw] max-h-[85vh] rounded-xl transition ${
              zoom ? "scale-125" : "scale-100"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setZoom(!zoom);
            }}
          />
        </div>
      )}
    </>
  );
}

export default PropertyTable;