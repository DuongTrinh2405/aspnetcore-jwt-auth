import { useEffect, useState } from "react";
import { CUSTOMER_STATUS_OPTIONS } from "../../utils/customerConstants";
import { formStyles } from "../../styles/formStyles";

function CustomerForm({ initialData, onSubmit, onClose }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    status: 0,
    lastContactDate: null,
  });

  const [loading, setLoading] = useState(false);
  const isEdit = !!initialData;

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        address: initialData.address || "",
        status: initialData.status ?? 0,
        lastContactDate: initialData.lastContactDate || null,
      });
    } else {
      setForm({
        name: "",
        email: "",
        phone: "",
        address: "",
        status: 0,
        lastContactDate: null,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "status" ? Number(value) : value,
    });
  };

  const validate = () => {
    if (!form.name) return "Tên không được để trống";
    if (!form.phone) return "SĐT không được để trống";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validate();
    if (error) return alert(error);

    try {
      setLoading(true);

      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address || "",
        lastContactDate: form.lastContactDate,
      };

      if (isEdit) {
        payload.status = form.status;
      }

      await onSubmit(payload);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={formStyles.overlay}>
      <div style={formStyles.modal}>
        {/* TITLE */}
        <h3 style={formStyles.title}>
          {isEdit ? "Cập nhật khách hàng" : "Thêm khách hàng"}
        </h3>

        <p style={formStyles.subtitle}>
          Nhập thông tin khách hàng
        </p>

        {/* FORM */}
        <form onSubmit={handleSubmit} style={formStyles.form}>
          {/* NAME */}
          <div style={formStyles.formGroup}>
            <label style={formStyles.label}>
              Tên khách hàng *
            </label>
            <input
              name="name"
              placeholder="Nhập tên khách hàng"
              value={form.name}
              onChange={handleChange}
              style={formStyles.input}
            />
          </div>

          {/* EMAIL */}
          <div style={formStyles.formGroup}>
            <label style={formStyles.label}>Email</label>
            <input
              name="email"
              type="email"
              placeholder="Nhập email"
              value={form.email}
              onChange={handleChange}
              style={formStyles.input}
            />
          </div>

          {/* PHONE */}
          <div style={formStyles.formGroup}>
            <label style={formStyles.label}>
              Số điện thoại *
            </label>
            <input
              name="phone"
              placeholder="Nhập số điện thoại"
              value={form.phone}
              onChange={handleChange}
              style={formStyles.input}
            />
          </div>

          {/* ADDRESS */}
          <div style={formStyles.formGroup}>
            <label style={formStyles.label}>Địa chỉ</label>
            <input
              name="address"
              placeholder="Nhập địa chỉ"
              value={form.address}
              onChange={handleChange}
              style={formStyles.input}
            />
          </div>

          {/* STATUS */}
          {isEdit && (
            <div style={formStyles.formGroup}>
              <label style={formStyles.label}>Trạng thái</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                style={formStyles.select}
              >
                {CUSTOMER_STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          )}

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
              {loading
                ? "Đang lưu..."
                : isEdit
                ? "Cập nhật"
                : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CustomerForm;