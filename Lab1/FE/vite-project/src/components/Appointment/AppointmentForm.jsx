import { useState, useEffect } from "react";
import { formStyles as styles } from "../../styles/formStyles";

function AppointmentForm({
  initialData,
  customers = [],
  properties = [],
  onSubmit,
  onClose,
}) {
  const [form, setForm] = useState({
    customerId: "",
    propertyId: "",
    dateTime: "",
    status: 0,
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const isEdit = !!initialData;

  const formatForInput = (date) => {
    if (!date) return "";
    return new Date(date).toISOString().slice(0, 16);
  };

  useEffect(() => {
    if (initialData) {
      setForm({
        customerId: initialData.customerId || "",
        propertyId: initialData.propertyId || "",
        dateTime: formatForInput(initialData.dateTime),
        status: initialData.status ?? 0,
        notes: initialData.notes || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "status" ||
        name === "customerId" ||
        name === "propertyId"
          ? Number(value)
          : value,
    }));
  };

  const validate = () => {
    if (!form.customerId) return "Chọn khách hàng";
    if (!form.propertyId) return "Chọn bất động sản";
    if (!form.dateTime) return "Chọn ngày giờ";

    const selectedDate = new Date(form.dateTime);
    if (selectedDate < new Date()) {
      return "Không thể đặt lịch trong quá khứ";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validate();
    if (error) return alert(error);

    try {
      setLoading(true);

      await onSubmit({
        customerId: form.customerId,
        propertyId: form.propertyId,
        dateTime: new Date(form.dateTime).toISOString(),
        status: form.status,
        notes: form.notes,
      });
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleFocus = (e) => {
    Object.assign(e.target.style, styles.focus);
  };

  const handleBlur = (e, baseStyle) => {
    Object.assign(e.target.style, baseStyle);
  };

  const handleHover = (e) => {
    Object.assign(e.target.style, styles.btnHover);
  };

  const handleLeave = (e) => {
    Object.assign(e.target.style, styles.btnPrimary);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* HEADER */}
        <h3 style={styles.title}>
          {isEdit ? "Cập nhật lịch hẹn" : "Tạo lịch hẹn"}
        </h3>
        <p style={styles.subtitle}>
          Điền thông tin để {isEdit ? "cập nhật" : "tạo"} lịch hẹn
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* CUSTOMER */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Khách hàng *</label>
            <select
              name="customerId"
              value={form.customerId}
              onChange={handleChange}
              style={styles.select}
              onFocus={handleFocus}
              onBlur={(e) => handleBlur(e, styles.select)}
            >
              <option value="">-- Chọn khách hàng --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* PROPERTY */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Bất động sản *</label>
            <select
              name="propertyId"
              value={form.propertyId}
              onChange={handleChange}
              style={styles.select}
              onFocus={handleFocus}
              onBlur={(e) => handleBlur(e, styles.select)}
            >
              <option value="">-- Chọn BĐS --</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* DATETIME */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Ngày giờ *</label>
            <input
              type="datetime-local"
              name="dateTime"
              value={form.dateTime}
              onChange={handleChange}
              min={new Date().toISOString().slice(0, 16)}
              style={styles.input}
              onFocus={handleFocus}
              onBlur={(e) => handleBlur(e, styles.input)}
            />
          </div>

          {/* STATUS */}
          {isEdit && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Trạng thái</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                style={styles.select}
                onFocus={handleFocus}
                onBlur={(e) => handleBlur(e, styles.select)}
              >
                <option value={0}>Scheduled</option>
                <option value={1}>Completed</option>
                <option value={2}>Cancelled</option>
                <option value={3}>No Show</option>
              </select>
            </div>
          )}

          {/* NOTES */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Ghi chú</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              style={styles.textarea}
              onFocus={handleFocus}
              onBlur={(e) => handleBlur(e, styles.textarea)}
            />
          </div>

          {/* ACTIONS */}
          <div style={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              style={{ ...styles.btn, ...styles.btnSecondary }}
            >
              Huỷ
            </button>

            <button
              type="submit"
              disabled={loading}
              onMouseEnter={handleHover}
              onMouseLeave={handleLeave}
              style={{
                ...styles.btn,
                ...styles.btnPrimary,
                ...(loading ? styles.btnDisabled : {}),
              }}
            >
              {loading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AppointmentForm;