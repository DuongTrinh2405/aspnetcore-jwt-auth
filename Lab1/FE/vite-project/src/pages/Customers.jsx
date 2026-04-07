import { useEffect, useState, useCallback } from "react";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../services/customerService";
import api from "../services/api";

import CustomerTable from "../components/Customer/CustomerTable";
import CustomerForm from "../components/Customer/CustomerForm";
import { CUSTOMER_STATUS_OPTIONS } from "../utils/customerConstants";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    keyword: "",
    status: "",
  });

  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [employeeDetail, setEmployeeDetail] = useState(null);

  // 🔥 PAGINATION
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // ==============================
  // FETCH
  // ==============================
  const fetchCustomers = useCallback(async (params = {}, currentPage = 1) => {
    try {
      setLoading(true);

      const res = await getCustomers({
        keyword: params.keyword || "",
        status: params.status !== "" ? Number(params.status) : undefined,
        page: currentPage,
        pageSize: pageSize,
      });

      setCustomers(res.data);
      setTotalPages(res.totalPages || 1);
      setPage(currentPage);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  // ==============================
  // LOAD
  // ==============================
  useEffect(() => {
    fetchCustomers(filters, page);
  }, [fetchCustomers, filters, page]);

  // 🔥 SEARCH debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers(filters, 1);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters.keyword]);

  // ==============================
  // CRUD
  // ==============================
  const handleSubmit = async (formData) => {
    try {
      if (user.role === "Admin") {
        alert("Admin không được phép tạo/sửa khách hàng");
        return;
      }

      if (editing) {
        await updateCustomer(editing.id, formData);
      } else {
        await createCustomer(formData);
      }

      setIsOpen(false);
      setEditing(null);
      fetchCustomers(filters, page);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Submit lỗi");
    }
  };

  const handleDelete = async (id) => {
    if (user.role === "Admin") {
      alert("Admin không được phép xoá");
      return;
    }

    if (!window.confirm("Bạn có chắc muốn xoá?")) return;

    try {
      await deleteCustomer(id);
      fetchCustomers(filters, page);
    } catch (err) {
      alert(err?.response?.data?.message || "Xoá lỗi");
    }
  };

  const handleCreate = () => {
    setEditing(null);
    setIsOpen(true);
  };

  const handleEdit = (customer) => {
    setEditing(customer);
    setIsOpen(true);
  };

  // ==============================
  // VIEW EMPLOYEE
  // ==============================
  const handleViewEmployee = async (id) => {
    try {
      const res = await api.get(`/Employees/${id}`);
      const data = res.data.data || res.data;
      setEmployeeDetail(data);
    } catch (err) {
      console.error(err);
      alert("Không load được nhân viên");
    }
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

  // ==============================
  // RENDER
  // ==============================
  return (
    <div className="app-page space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Customers</h2>
          <p className="text-slate-600 mt-1">Quản lý khách hàng</p>
        </div>

        {user.role !== "Admin" && (
          <button
            onClick={handleCreate}
            className="app-button-primary"
          >
            + Thêm khách hàng
          </button>
        )}
      </div>

      {/* 🔥 SEARCH UI ĐẸP */}
      <div className="app-card-soft p-6 flex flex-col md:flex-row gap-4 w-full items-stretch">
        
        {/* INPUT */}
        <input
          type="text"
          placeholder="Tìm kiếm khách hàng..."
          value={filters.keyword}
          onChange={(e) =>
            setFilters({ ...filters, keyword: e.target.value })
          }
          className="flex-1 w-full min-w-[300px] px-5 py-3 border border-gray-300 
                     rounded-xl shadow-sm 
                     text-black bg-white placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-blue-500 
                     focus:border-blue-500 transition"
        />

        {/* SELECT */}
        <select
          value={filters.status}
          onChange={(e) =>
            setFilters({ ...filters, status: e.target.value })
          }
          className="px-5 py-3 border border-gray-300 rounded-xl 
                     bg-white text-black shadow-sm"
        >
          <option value="">Tất cả trạng thái</option>
          {CUSTOMER_STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        {/* RESET */}
        <button
          onClick={() => {
            setFilters({ keyword: "", status: "" });
            setPage(1);
          }}
          className="px-5 py-3 rounded-xl border border-gray-300 
                     bg-gray-100 hover:bg-gray-200 transition"
        >
          Reset
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <CustomerTable
          data={customers}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          user={user}
          onViewEmployee={handleViewEmployee}
        />
      </div>

      {/* PAGINATION */}
      {renderPagination()}

      <p className="text-sm text-gray-500 text-center">
        Trang {page} / {totalPages}
      </p>

      {/* FORM */}
      {isOpen && (
        <CustomerForm
          initialData={editing}
          onSubmit={handleSubmit}
          onClose={() => {
            setIsOpen(false);
            setEditing(null);
          }}
        />
      )}

      {/* MODAL EMPLOYEE */}
      {employeeDetail && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-[400px] shadow-lg">
            <h3 className="text-lg font-bold mb-4">Chi tiết nhân viên</h3>

            <p><b>ID:</b> {employeeDetail.id}</p>
            <p><b>Tên:</b> {employeeDetail.name}</p>
            <p><b>Email:</b> {employeeDetail.email}</p>
            <p><b>SĐT:</b> {employeeDetail.phone}</p>

            <button
              onClick={() => setEmployeeDetail(null)}
              className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Customers;