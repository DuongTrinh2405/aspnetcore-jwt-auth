import { useEffect, useState, useCallback } from "react";
import {
  createDeal,
  updateDeal,
  closeDeal,
  deleteDeal,
  searchDeals,
} from "../services/dealService";

import customerService from "../services/customerService";
import DealForm from "../components/Deal/DealForm";
import DealTable from "../components/Deal/DealTable";

function Deals() {
  const [deals, setDeals] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ ROLE
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "Admin";

  // 🔥 FILTER giống Property
  const [filters, setFilters] = useState({
    search: "",
    stage: "",
    status: "",
  });

  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
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

      const res = await searchDeals(filters.search, {
        stage: filters.stage || undefined,
        status: filters.status || undefined,
        page: currentPage,
        pageSize,
        sortBy: sortOrder ? "amount" : undefined,
        sortOrder: sortOrder || undefined,
      });

      const list = Array.isArray(res) ? res : res?.data || [];

      setDeals(list);

      setTotalPages(list.length < pageSize ? currentPage : currentPage + 1);
      setPage(currentPage);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tải deals");
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
  }, [filters, sortOrder]);

  // ==============================
  // CUSTOMERS
  // ==============================
  const fetchCustomers = async () => {
    const data = await customerService.getCustomers();
    setCustomers(Array.isArray(data) ? data : data?.data || []);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // ==============================
  // CRUD (ĐÃ CHẶN ADMIN)
  // ==============================
  const handleSubmit = async (payload) => {
    if (isAdmin) {
      alert("Admin chỉ được xem!");
      return;
    }

    if (editing) {
      await updateDeal(editing.id, payload);
    } else {
      await createDeal(payload);
    }

    setIsOpen(false);
    setEditing(null);
    fetchData(page);
  };

  const handleEdit = (deal) => {
    if (isAdmin) return;

    setEditing({
      ...deal,
      stage: Number(deal.stage),
      status: Number(deal.status),
    });
    setIsOpen(true);
  };

  const handleClose = async (deal) => {
    if (isAdmin) return;

    if (!window.confirm("Đóng deal?")) return;
    await closeDeal(deal);
    fetchData(page);
  };

  const handleDelete = async (id) => {
    if (isAdmin) return;

    if (!window.confirm("Xoá deal?")) return;
    await deleteDeal(id);
    fetchData(page);
  };

  // ==============================
  // PAGINATION
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
          <h2 className="text-2xl font-bold text-slate-800">Deals</h2>
          <p className="text-slate-600 mt-1">Quản lý giao dịch</p>
        </div>

        {/* ❌ ADMIN KHÔNG THẤY */}
        {!isAdmin && (
          <button
            onClick={() => {
              setEditing(null);
              setIsOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            + Tạo deal
          </button>
        )}
      </div>

      {/* FILTER */}
      <div className="bg-white rounded-xl shadow-sm border p-6 flex flex-wrap items-center gap-4">
        <input
          type="text"
          placeholder="Tìm kiếm deal..."
          value={filters.search}
          onChange={(e) =>
            setFilters({ ...filters, search: e.target.value })
          }
          className="flex-1 min-w-[250px] border px-3 py-2 rounded"
        />

        <select
          value={filters.stage}
          onChange={(e) =>
            setFilters({ ...filters, stage: e.target.value })
          }
          className="border px-3 py-2 rounded w-[160px]"
        >
          <option value="">All</option>
          <option value="Prospect">Prospect</option>
          <option value="Qualified">Qualified</option>
          <option value="Proposal">Proposal</option>
          <option value="Negotiation">Negotiation</option>
          <option value="Won">Won</option>
          <option value="Lost">Lost</option>
        </select>

        <select
          value={filters.status}
          onChange={(e) =>
            setFilters({ ...filters, status: e.target.value })
          }
          className="border px-3 py-2 rounded w-[160px]"
        >
          <option value="">All</option>
          <option value="Open">Open</option>
          <option value="InProgress">InProgress</option>
          <option value="Won">Won</option>
          <option value="Lost">Lost</option>
        </select>

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="border px-3 py-2 rounded w-[160px]"
        >
          <option value="">Default</option>
          <option value="asc">Amount ↑</option>
          <option value="desc">Amount ↓</option>
        </select>
      </div>

      {/* TABLE */}
      <DealTable
        data={deals}
        customers={customers}
        loading={loading}
        onEdit={handleEdit}
        onClose={handleClose}
        onDelete={handleDelete}
        isAdmin={isAdmin}
      />

      {renderPagination()}

      <p className="text-sm text-gray-500 text-center">
        Trang {page} / {totalPages}
      </p>

      {isOpen && (
        <DealForm
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

export default Deals;