import { useEffect, useState } from "react";
import { CUSTOMER_STATUS_OPTIONS } from "../../utils/customerConstants";

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

      // ✅ CHỈ gửi status khi EDIT
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <h3 className="text-xl font-semibold text-slate-800 mb-6">
            {isEdit ? "Cập nhật khách hàng" : "Thêm khách hàng"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* NAME */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tên khách hàng *
              </label>
              <input
                name="name"
                placeholder="Nhập tên khách hàng"
                value={form.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <input
                name="email"
                type="email"
                placeholder="Nhập email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* PHONE */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Số điện thoại *
              </label>
              <input
                name="phone"
                placeholder="Nhập số điện thoại"
                value={form.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* ADDRESS */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Địa chỉ
              </label>
              <input
                name="address"
                placeholder="Nhập địa chỉ"
                value={form.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* ✅ STATUS - CHỈ HIỆN KHI EDIT */}
            {isEdit && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Trạng thái
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {CUSTOMER_STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* BUTTON */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 rounded-lg hover:bg-slate-200"
              >
                Huỷ
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400"
              >
                {loading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo mới"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CustomerForm;