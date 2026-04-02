import { useState, useEffect } from "react";
import {
  EMPLOYEE_ROLE_OPTIONS,
  EMPLOYEE_STATUS_OPTIONS,
} from "../../utils/constants";

function EmployeeForm({ onSubmit, onClose, initialData = null }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: 2,
    status: 1,
  });

  const [loading, setLoading] = useState(false);

  // ==============================
  // MAP ENUM
  // ==============================
  const mapRole = (role) => {
    if (role === "Admin" || role === 1) return 1;
    if (role === "Staff" || role === 2) return 2;
    return 2;
  };

  const mapStatus = (status) => {
    if (status === "Active" || status === 1) return 1;
    if (status === "Inactive" || status === 2) return 2;
    return 1;
  };

  const safeNumber = (val, fallback = 0) => {
    const n = Number(val);
    return isNaN(n) ? fallback : n;
  };

  // ==============================
  // SYNC DATA
  // ==============================
  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name ?? "",
        email: initialData.email ?? "",
        phone: initialData.phone ?? "",
        password: "",
        role: mapRole(initialData.role),
        status: mapStatus(initialData.status),
      });
    } else {
      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: 2,
        status: 1,
      });
    }
  }, [initialData]);

  // ==============================
  // CHANGE
  // ==============================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "role" || name === "status"
          ? safeNumber(value, 0)
          : value,
    }));
  };

  // ==============================
  // VALIDATE
  // ==============================
  const validate = () => {
    if (!form.name.trim()) return "Vui lòng nhập tên";
    if (!form.email.trim()) return "Vui lòng nhập email";
    if (!form.phone.trim()) return "Vui lòng nhập số điện thoại";

    if (!initialData) {
      if (!form.password.trim()) return "Vui lòng nhập mật khẩu";
      if (form.password.length < 6)
        return "Mật khẩu phải >= 6 ký tự";
    }

    if (initialData && form.password.trim()) {
      if (form.password.length < 6)
        return "Mật khẩu phải >= 6 ký tự";
    }

    return null;
  };

  // ==============================
  // 🔥 ERROR HANDLER (FIX UX)
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
  // SUBMIT
  // ==============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validate();
    if (error) {
      alert(error);
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone?.trim() || "",
        role: safeNumber(form.role, 0),
        status: safeNumber(form.status, 0),

        // 🔥 FIX: luôn gửi password
        password: form.password?.trim() || "123456",
      };

      console.log("SUBMIT:", payload);

      await onSubmit(payload);
      onClose();
    } catch (err) {
      console.error("FULL ERROR:", err?.response?.data);
      alert(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // UI
  // ==============================
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>
          {initialData ? "Edit Employee" : "Create Employee"}
        </h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            name="name"
            placeholder="Full name"
            value={form.name}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            name="phone"
            placeholder="Phone"
            value={form.phone}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            name="password"
            type="password"
            placeholder={
              initialData
                ? "Đổi mật khẩu (không bắt buộc)"
                : "Nhập mật khẩu"
            }
            value={form.password}
            onChange={handleChange}
            style={styles.input}
          />

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            style={styles.input}
          >
            {EMPLOYEE_ROLE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            style={styles.input}
          >
            {EMPLOYEE_STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <div style={styles.actions}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>
              Cancel
            </button>

            <button type="submit" disabled={loading} style={styles.saveBtn}>
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EmployeeForm;

// ==============================
const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    background: "#fff",
    padding: "24px",
    borderRadius: "16px",
    width: "400px",
  },
  title: { marginBottom: "16px" },
  form: { display: "flex", flexDirection: "column", gap: "12px" },
  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ddd",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
  },
  cancelBtn: {
    padding: "8px 12px",
    background: "#9ca3af",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
  },
  saveBtn: {
    padding: "8px 12px",
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
  },
};