import { useState } from "react";
import PropertyGalleryModal from "./PropertyGalleryModal";

const statusMap = {
  0: "Available",
  1: "Reserved",
  2: "Sold",
  3: "Rented",
  4: "Negotiation",
  5: "Off Market",
};

// 🔥 Helper to get proper image URL
const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  if (url.startsWith("/")) return url;
  return `/${url}`;
};

function PropertyTable({
  data = [],
  loading,
  onEdit,
  onDelete,
  onFilterStatus,
}) {
  const [preview, setPreview] = useState(null);
  const [zoom, setZoom] = useState(false);
  const [galleryProperty, setGalleryProperty] = useState(null);

  // LOADING
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-slate-600">Đang tải dữ liệu...</span>
      </div>
    );
  }

  // EMPTY
  if (!data.length) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Không có dữ liệu</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold">ID</th>
              <th className="px-6 py-4 text-left text-xs font-semibold">Image</th>
              <th className="px-6 py-4 text-left text-xs font-semibold">Title</th>
              <th className="px-6 py-4 text-left text-xs font-semibold">Price</th>
              <th className="px-6 py-4 text-left text-xs font-semibold">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold">Created By</th>
              <th className="px-6 py-4 text-left text-xs font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition">
                {/* ID */}
                <td className="px-6 py-4 text-sm font-medium">
                  #{item.id}
                </td>

                {/* IMAGES */}
                <td className="px-6 py-4">
                  {item.imageUrls && item.imageUrls.length > 0 ? (
                    <div className="relative">
                      <img
                        src={getImageUrl(item.imageUrls[0])}
                        alt="Property"
                        className="w-20 h-16 object-cover rounded-lg cursor-pointer hover:scale-105 transition"
                        onClick={() => {
                          setPreview(getImageUrl(item.imageUrls[0]));
                          setZoom(false);
                        }}
                      />
                      {item.imageUrls.length > 1 && (
                        <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs px-1 py-0.5 rounded">
                          +{item.imageUrls.length - 1}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-20 h-16 bg-slate-200 rounded-lg flex items-center justify-center">
                      <span className="text-xs">No Image</span>
                    </div>
                  )}
                </td>

                {/* TITLE */}
                <td className="px-6 py-4 text-sm font-semibold">
                  {item.title}
                </td>

                {/* PRICE */}
                <td className="px-6 py-4 text-sm font-bold text-blue-600">
                  {Number(item.price || 0).toLocaleString()} đ
                </td>

                {/* STATUS */}
                <td className="px-6 py-4">
                  <span
                    onClick={() =>
                      onFilterStatus && onFilterStatus(item.status)
                    }
                    className={`px-3 py-1 text-xs rounded-full cursor-pointer hover:opacity-80 ${
                      item.status === 0
                        ? "bg-blue-100 text-blue-800"
                        : item.status === 1
                        ? "bg-yellow-100 text-yellow-800"
                        : item.status === 2
                        ? "bg-green-100 text-green-800"
                        : item.status === 3
                        ? "bg-indigo-100 text-indigo-800"
                        : item.status === 4
                        ? "bg-purple-100 text-purple-800"
                        : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    {statusMap[item.status] || "Unknown"}
                  </span>
                </td>

                {/* CREATED BY */}
                <td className="px-6 py-4 text-sm text-slate-700">
                  {item.employeeName || "Unknown"}
                </td>

                {/* ACTION */}
                <td className="px-6 py-4 space-x-2">
                  {item.imageUrls && item.imageUrls.length > 0 && (
                    <button
                      onClick={() => setGalleryProperty(item)}
                      className="px-3 py-1 text-sm bg-indigo-100 rounded hover:bg-indigo-200 transition"
                    >
                      Gallery
                    </button>
                  )}

                  <button
                    onClick={() => onEdit(item)}
                    className="px-3 py-1 text-sm bg-amber-100 rounded hover:bg-amber-200 transition"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => onDelete(item.id)}
                    className="px-3 py-1 text-sm bg-red-100 rounded hover:bg-red-200 transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔥 PREVIEW IMAGE (FIX TO + ZOOM XỊN) */}
      {preview && (
        <div
          className="fixed inset-0 bg-black/95 flex items-center justify-center z-50"
          onClick={() => setPreview(null)}
        >
          {/* Nút đóng */}
          <button
            className="absolute top-5 right-5 text-white text-3xl hover:scale-110 transition"
            onClick={() => setPreview(null)}
          >
            ✕
          </button>

          <img
            src={preview}
            alt=""
            className={`transition duration-300 cursor-zoom-in ${
              zoom
                ? "scale-150 max-w-none max-h-none"
                : "max-w-[95vw] max-h-[95vh]"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setZoom(!zoom);
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              setZoom(!zoom);
            }}
          />
        </div>
      )}

      {/* GALLERY MODAL */}
      {galleryProperty && (
        <PropertyGalleryModal
          property={galleryProperty}
          onClose={() => setGalleryProperty(null)}
        />
      )}
    </>
  );
}

export default PropertyTable;