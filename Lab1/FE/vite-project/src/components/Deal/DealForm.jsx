import { useState, useEffect } from "react";
import {
  DEAL_STAGE_OPTIONS,
  DEAL_STATUS_OPTIONS,
} from "../../utils/dealConstants";
import customerService from "../../services/customerService";
import propertyService from "../../services/propertyService";
import employeeService from "../../services/employeeService";

function DealForm({ initialData, onSubmit, onClose }) {
  const [form, setForm] = useState({
    title: "",
    amount: "",
    customerId: "",
    propertyId: "",
    stage: 0,
    status: 0,
    notes: "",
  });

  const [customers, setCustomers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
    fetchProperties();
  }, []);

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialData,
        stage: Number(initialData.stage),
        status: Number(initialData.status),
      });
    }
  }, [initialData]);

  const fetchCustomers = async () => {
    const data = await customerService.getCustomers();
    setCustomers(data || []);
  };

  const fetchProperties = async () => {
    const data = await propertyService.getProperties();
    setProperties(data || []);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!form.title.trim()) {
      alert("Vui lòng nhập tiêu đề");
      return;
    }
    if (!form.amount || form.amount <= 0) {
      alert("Vui lòng nhập giá hợp lệ");
      return;
    }
    if (!form.customerId) {
      alert("Vui lòng chọn khách hàng");
      return;
    }

    const payload = {
      ...form,
      amount: Number(form.amount),
      stage: Number(form.stage),
      status: Number(form.status),
      customerId: Number(form.customerId),
      propertyId: form.propertyId
        ? Number(form.propertyId)
        : null,
    };

    setLoading(true);
    try {
      await onSubmit(payload);
    } catch (error) {
      console.error("Submit error:", error);
      alert("Lỗi khi lưu deal: " + (error.message || "Vui lòng thử lại"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>
          {initialData ? "Edit Deal" : "Create Deal"}
        </h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Property name"
            style={styles.input}
          />

          <input
            name="amount"
            value={form.amount}
            onChange={handleChange}
            placeholder="Price (VND)"
            style={styles.input}
          />

          <select
            name="customerId"
            value={form.customerId || ""}
            onChange={handleChange}
            style={styles.input}
          >
            <option value="">Select customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            name="propertyId"
            value={form.propertyId || ""}
            onChange={handleChange}
            style={styles.input}
          >
            <option value="">Select property</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>

          <select
            name="stage"
            value={form.stage}
            onChange={handleChange}
            style={styles.input}
          >
            {DEAL_STAGE_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            style={styles.input}
          >
            {DEAL_STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Notes..."
            style={{ ...styles.input, height: 80 }}
          />

          <div style={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              style={{ ...styles.button, background: "#9ca3af" }}
            >
              Cancel
            </button>

            <button
              type="submit"
              style={{ ...styles.button, background: "#3b82f6" }}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DealForm;

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
    width: "420px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  },

  title: {
    marginBottom: "16px",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    fontSize: "14px",
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "10px",
  },

  button: {
    padding: "8px 14px",
    border: "none",
    borderRadius: "8px",
    color: "#fff",
    cursor: "pointer",
  },
};