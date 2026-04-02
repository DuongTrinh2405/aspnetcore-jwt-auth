import { useEffect, useState, useCallback } from "react";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../services/customerService";

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

  // 🔥 thêm user để check role (KHÔNG phá UI)
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchCustomers = useCallback(async (params = {}) => {
    try {
      setLoading(true);

      const res = await getCustomers({
        keyword: params.keyword || "",
        status: params.status !== "" ? Number(params.status) : undefined,
        page: 1,
        pageSize: 10,
      });

      setCustomers(res.data);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers(filters);
  }, [fetchCustomers, filters]);

  // debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers(filters);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters.keyword]);

  const handleSubmit = async (formData) => {
    try {
      // 🔥 chặn admin
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
      fetchCustomers(filters);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Submit lỗi");
    }
  };

  const handleDelete = async (id) => {
    // 🔥 chặn admin
    if (user.role === "Admin") {
      alert("Admin không được phép xoá");
      return;
    }

    if (!window.confirm("Bạn có chắc muốn xoá?")) return;

    try {
      await deleteCustomer(id);
      fetchCustomers(filters);
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

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Customers</h2>
          <p className="text-slate-600 mt-1">Quản lý khách hàng</p>
        </div>

        {/* 🔥 chỉ ẩn nút, không đổi UI */}
        {user.role !== "Admin" && (
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            + Thêm khách hàng
          </button>
        )}
      </div>

      {/* SEARCH + FILTER */}
      <div className="bg-white rounded-xl border p-6 flex gap-4">
        <input
          type="text"
          placeholder="Tìm kiếm khách hàng..."
          value={filters.keyword}
          onChange={(e) =>
            setFilters({ ...filters, keyword: e.target.value })
          }
          className="flex-1 px-3 py-2 border rounded-lg"
        />

        <select
          value={filters.status}
          onChange={(e) =>
            setFilters({ ...filters, status: e.target.value })
          }
          className="px-3 py-2 border rounded-lg"
        >
          <option value="">Tất cả trạng thái</option>
          {CUSTOMER_STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <button
          onClick={() => setFilters({ keyword: "", status: "" })}
          className="px-3 py-2 bg-gray-200 rounded-lg"
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
          user={user} // 🔥 truyền xuống table
        />
      </div>

      {/* MODAL */}
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
    </div>
  );
}

export default Customers;