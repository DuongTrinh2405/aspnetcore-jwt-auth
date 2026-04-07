import { useEffect, useState, useCallback } from "react";
import {
  getEmployees,
  createEmployee,
  deleteEmployee,
  updateEmployee,
  searchEmployees,
} from "../services/employeeService";

import EmployeeForm from "../components/Employee/EmployeeForm";
import EmployeeTable from "../components/Employee/EmployeeTable";

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [filters, setFilters] = useState({
    role: null,
    status: null,
  });

  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  // ==============================
  // 🔥 ERROR HANDLER (FIX CHÍNH)
  // ==============================
  const getErrorMessage = (err) => {
    const res = err?.response?.data;

    if (res?.errors) {
      const firstKey = Object.keys(res.errors)[0];
      const msg = res.errors[firstKey][0];

      if (firstKey === "Phone") return "Số điện thoại không hợp lệ";
      if (firstKey === "Email") return "Email không hợp lệ";
      if (firstKey === "Name") return "Tên không hợp lệ";
      if (firstKey === "Password") return "Mật khẩu không hợp lệ";

      return msg;
    }

    if (res?.message) return res.message;

    return "Lỗi khi lưu";
  };

  // ==============================
  // FETCH
  // ==============================
  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);

      const hasSearch = search.trim();

      let data;

      if (hasSearch || filters.role || filters.status) {
        data = await searchEmployees(search.trim(), filters);
      } else {
        data = await getEmployees();
      }

      setEmployees(data);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tải nhân viên");
    } finally {
      setLoading(false);
    }
  }, [search, filters]);

  // ==============================
  // INITIAL LOAD
  // ==============================
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // ==============================
  // DEBOUNCE SEARCH
  // ==============================
  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchEmployees();
    }, 400);

    return () => clearTimeout(debounce);
  }, [search, filters, fetchEmployees]);

  // ==============================
  // CREATE
  // ==============================
  const handleCreate = () => {
    setEditing(null);
    setIsOpen(true);
  };

  // ==============================
  // EDIT
  // ==============================
  const handleEdit = (item) => {
    setEditing(item);
    setIsOpen(true);
  };

  // ==============================
  // SUBMIT (🔥 FIX Ở ĐÂY)
  // ==============================
  const handleSubmit = async (payload) => {
    try {
      if (editing) {
        await updateEmployee(editing.id, payload);
      } else {
        await createEmployee(payload);
      }

      setIsOpen(false);
      setEditing(null);

      await fetchEmployees();
    } catch (err) {
      console.error("FULL ERROR:", err?.response?.data);
      alert(getErrorMessage(err)); // ✅ FIX
    }
  };

  // ==============================
  // DELETE
  // ==============================
  const handleDelete = async (id) => {
    if (!window.confirm("Xoá nhân viên này?")) return;

    try {
      await deleteEmployee(id);
      await fetchEmployees();
    } catch (err) {
      alert(getErrorMessage(err)); // dùng chung luôn
    }
  };

  return (
    <div className="app-page space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Nhân viên</h2>
          <p className="text-slate-600 mt-1">
            Quản lý nhân viên công ty
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Thêm nhân viên
        </button>
      </div>

      {/* SEARCH + FILTER */}
      <div className="bg-white p-6 rounded-xl border">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border px-3 py-2 rounded"
          />

          <select
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                role: e.target.value ? Number(e.target.value) : null,
              }))
            }
            className="border px-3 py-2 rounded"
          >
            <option value="">All Role</option>
            <option value="1">Admin</option>
            <option value="2">Staff</option>
          </select>

          <select
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                status: e.target.value ? Number(e.target.value) : null,
              }))
            }
            className="border px-3 py-2 rounded"
          >
            <option value="">All Status</option>
            <option value="1">Active</option>
            <option value="2">Inactive</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <EmployeeTable
        data={employees}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* MODAL */}
      {isOpen && (
        <EmployeeForm
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

export default Employees;