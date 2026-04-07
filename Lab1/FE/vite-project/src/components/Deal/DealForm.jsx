import { useState, useEffect } from "react";
import {
  DEAL_STAGE_OPTIONS,
  DEAL_STATUS_OPTIONS,
} from "../../utils/dealConstants";

import customerService from "../../services/customerService";
import propertyService from "../../services/propertyService";
import { formStyles } from "../../styles/formStyles";

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

  const isEdit = !!initialData;

  useEffect(() => {
    fetchCustomers();
    fetchProperties();
  }, []);

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialData,
        stage: Number(initialData.stage ?? 0),
        status: Number(initialData.status ?? 0),
        customerId: initialData.customerId || "",
        propertyId: initialData.propertyId || "",
      });
    }
  }, [initialData]);

  const fetchCustomers = async () => {
    try {
      const data = await customerService.getCustomers();
      setCustomers(Array.isArray(data) ? data : data?.data || []);
    } catch {
      setCustomers([]);
    }
  };

  const fetchProperties = async () => {
    try {
      const data = await propertyService.getProperties();
      setProperties(Array.isArray(data) ? data : data?.data || []);
    } catch {
      setProperties([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) return alert("Nhập tiêu đề");
    if (!form.amount || Number(form.amount) <= 0)
      return alert("Giá không hợp lệ");
    if (!form.customerId) return alert("Chọn khách hàng");

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

    try {
      setLoading(true);
      await onSubmit(payload);
    } catch (err) {
      alert(err?.message || "Lỗi khi lưu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={formStyles.overlay}>
      <div
        style={{
          ...formStyles.modal,
          padding: "24px",
        }}
      >
        <h3 style={formStyles.title}>
          {isEdit ? "Cập nhật deal" : "Tạo deal"}
        </h3>

        <p style={{ ...formStyles.subtitle, marginBottom: "14px" }}>
          Nhập thông tin giao dịch
        </p>

        <form
          onSubmit={handleSubmit}
          style={{ ...formStyles.form, gap: "14px" }}
        >
          {/* TITLE */}
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Tên deal"
            style={formStyles.input}
          />

          {/* AMOUNT + CUSTOMER */}
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="Giá"
              style={{ ...formStyles.input, flex: 1 }}
            />

            <select
              name="customerId"
              value={form.customerId}
              onChange={handleChange}
              style={{ ...formStyles.select, flex: 1 }}
            >
              <option value="">Khách hàng</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* PROPERTY */}
          <select
            name="propertyId"
            value={form.propertyId}
            onChange={handleChange}
            style={formStyles.select}
          >
            <option value="">Bất động sản</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>

          {/* STAGE + STATUS */}
          <div style={{ display: "flex", gap: "10px" }}>
            <select
              name="stage"
              value={form.stage}
              onChange={handleChange}
              style={{ ...formStyles.select, flex: 1 }}
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
              style={{ ...formStyles.select, flex: 1 }}
            >
              {DEAL_STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* NOTES */}
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Ghi chú..."
            style={{
              ...formStyles.textarea,
              minHeight: "90px",
            }}
          />

          {/* ACTIONS */}
          <div style={formStyles.actions}>
            <button
              type="button"
              onClick={onClose}
              style={{
                ...formStyles.btn,
                ...formStyles.btnSecondary,
              }}
            >
              Huỷ
            </button>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...formStyles.btn,
                ...formStyles.btnPrimary,
                ...(loading ? formStyles.btnDisabled : {}),
              }}
            >
              {loading ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DealForm;