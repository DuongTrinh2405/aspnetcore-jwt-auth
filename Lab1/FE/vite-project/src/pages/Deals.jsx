import { useEffect, useState, useCallback } from "react";
import {
  getDeals,
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
  const [search, setSearch] = useState("");

  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  // ==============================
  // FETCH DEALS
  // ==============================
  const fetchDeals = useCallback(async (searchTerm = "") => {
    try {
      setLoading(true);
      let data;

      if (searchTerm.trim()) {
        data = await searchDeals(searchTerm.trim());
      } else {
        data = await getDeals();
      }

      setDeals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      alert(JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  }, []);

  // ==============================
  // FETCH CUSTOMERS
  // ==============================
  const fetchCustomers = async () => {
    try {
      const data = await customerService.getCustomers();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  // INIT LOAD
  useEffect(() => {
    fetchDeals();
    fetchCustomers();
  }, [fetchDeals]);

  // SEARCH DEBOUNCE
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchDeals(search);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [search, fetchDeals]);

  // ==============================
  // SUBMIT
  // ==============================
  const handleSubmit = async (payload) => {
    try {
      if (editing) {
        await updateDeal(editing.id, payload);
      } else {
        await createDeal(payload);
      }

      setIsOpen(false);
      setEditing(null);
      await fetchDeals(search);
    } catch (err) {
      console.error("Deal submit error:", err);
      alert("Lỗi khi lưu deal");
    }
  };

  // ==============================
  // ACTIONS
  // ==============================
  const handleEdit = (deal) => {
    setEditing(deal);
    setIsOpen(true);
  };

  const handleClose = async (deal) => {
    if (!window.confirm("Đóng deal này?")) return;

    try {
      await closeDeal(deal.id); // ✅ fix chuẩn API
      await fetchDeals(search);
    } catch (err) {
      alert(JSON.stringify(err));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xoá deal này?")) return;

    try {
      await deleteDeal(id);
      await fetchDeals(search);
    } catch (err) {
      alert(JSON.stringify(err));
    }
  };

  // ==============================
  // UI
  // ==============================
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Deals</h2>
          <p className="text-slate-600 mt-1">Quản lý giao dịch</p>
        </div>

        <button
          onClick={() => {
            setEditing(null);
            setIsOpen(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          + Tạo deal
        </button>
      </div>

      {/* SEARCH (FIXED UI) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="relative">
          {/* ICON */}
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* INPUT */}
          <input
            type="text"
            placeholder="Tìm kiếm deal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900 placeholder-slate-400"
          />

          {/* CLEAR BUTTON */}
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute inset-y-0 right-2 text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* FORM */}
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

      {/* TABLE */}
      <DealTable
        data={deals}
        customers={customers}
        loading={loading}
        onEdit={handleEdit}
        onClose={handleClose}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default Deals;