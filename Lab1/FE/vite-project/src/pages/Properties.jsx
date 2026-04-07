import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import {
  getProperties,
  createProperty,
  updateProperty,
  deleteProperty,
} from "../services/propertyService";

import PropertyTable from "../components/Property/PropertyTable";
import PropertyForm from "../components/Property/PropertyForm";

function Properties() {
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    type: "",
    status: "",
    minPrice: "",
    maxPrice: "",
  });

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [sortOrder, setSortOrder] = useState("");

  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  // ==============================
  // FETCH DATA
  // ==============================
  const fetchData = useCallback(async (currentPage = 1) => {
    try {
      setLoading(true);

      const res = await getProperties({
        ...filters,
        status: filters.status !== "" ? Number(filters.status) : undefined,
        page: currentPage,
        pageSize,
        sortBy: sortOrder ? "price" : undefined,
        sortOrder: sortOrder || undefined,
      });

      setProperties(res.data || []);

      const total = res.total || 0;
      setTotalPages(Math.ceil(total / pageSize));

      setPage(currentPage);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tải properties");
    } finally {
      setLoading(false);
    }
  }, [filters, sortOrder, pageSize]);

  // ==============================
  // LOAD
  // ==============================
  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchData(page);
    }, 300);

    return () => clearTimeout(debounce);
  }, [fetchData, page]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {
    setPage(1);
  }, [sortOrder]);

  // ==============================
  // CRUD
  // ==============================
  const handleSubmit = async (formData) => {
    try {
      if (editing) {
        await updateProperty(editing.id, formData);
      } else {
        await createProperty(formData);
      }

      setIsOpen(false);
      setEditing(null);
      fetchData(page);
    } catch {
      alert("Lỗi khi lưu property");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xoá?")) return;

    try {
      await deleteProperty(id);
      fetchData(page);
    } catch {
      alert("Lỗi khi xoá");
    }
  };

  const handleCreate = () => {
    setEditing(null);
    setIsOpen(true);
  };

  const handleEdit = (item) => {
    setEditing(item);
    setIsOpen(true);
  };

  const handleViewUser = (employeeId) => {
    if (!employeeId) return;
    navigate(`/employees/${employeeId}`);
  };

  // ==============================
  // PAGINATION UI
  // ==============================
  const renderPagination = () => {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
      .slice(Math.max(0, page - 3), page + 2);

    return (
      <div className="flex justify-center items-center gap-2 mt-6">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
        >
          ←
        </button>

        {pages.map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`px-3 py-1 rounded border ${
              p === page
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-100"
            }`}
          >
            {p}
          </button>
        ))}

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
        >
          →
        </button>
      </div>
    );
  };

  return (
    <div className="app-page space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Properties
          </h2>
          <p className="text-slate-600 mt-1">
            Quản lý bất động sản
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg"
        >
          Thêm property
        </button>
      </div>

      {/* FILTER (🔥 FIX UI) */}
      <div className="bg-white rounded-xl shadow-sm border p-6 flex flex-wrap items-center gap-4">
        {/* SEARCH */}
        <input
          type="text"
          placeholder="Tìm kiếm property..."
          value={filters.search}
          onChange={(e) =>
            setFilters({ ...filters, search: e.target.value })
          }
          className="flex-1 min-w-[250px] border px-3 py-2 rounded"
        />

        {/* STATUS */}
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 mb-1">Status</span>
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value })
            }
            className="border px-3 py-2 rounded w-[160px]"
          >
            <option value="">All Status</option>
            <option value="0">Available</option>
            <option value="1">Reserved</option>
            <option value="2">Sold</option>
            <option value="3">Rented</option>
            <option value="4">Negotiation</option>
            <option value="5">Off Market</option>
          </select>
        </div>

        {/* SORT PRICE */}
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 mb-1">Sort Price</span>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border px-3 py-2 rounded w-[160px]"
          >
            <option value="">Mặc định</option>
            <option value="asc">Giá tăng dần</option>
            <option value="desc">Giá giảm dần</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <PropertyTable
          data={properties}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewUser={handleViewUser}
        />
      </div>

      {/* PAGINATION */}
      {renderPagination()}

      <p className="text-sm text-gray-500 text-center">
        Trang {page} / {totalPages}
      </p>

      {/* MODAL */}
      {isOpen && (
        <PropertyForm
          initialData={editing}
          onSubmit={handleSubmit}
          onClose={() => {
            setIsOpen(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

export default Properties;