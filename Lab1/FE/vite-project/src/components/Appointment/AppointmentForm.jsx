import { useState, useEffect } from "react";

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
    date: "",
    status: 0,
    notes: "",
  });

  // ==============================
  // FORMAT DATE FOR INPUT
  // ==============================
  const formatForInput = (date) => {
    if (!date) return "";
    return new Date(date).toISOString().slice(0, 16);
  };

  // ==============================
  // LOAD EDIT DATA
  // ==============================
  useEffect(() => {
    if (initialData) {
      setForm({
        customerId: initialData.customerId || "",
        propertyId: initialData.propertyId || "",
        date: formatForInput(
          initialData.date || initialData.dateTime
        ),
        status: initialData.status ?? 0,
        notes: initialData.notes || "",
      });
    } else {
      // reset khi tạo mới
      setForm({
        customerId: "",
        propertyId: "",
        date: "",
        status: 0,
        notes: "",
      });
    }
  }, [initialData]);

  // ==============================
  // HANDLE CHANGE
  // ==============================
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

  // ==============================
  // SUBMIT
  // ==============================
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.customerId || !form.propertyId || !form.date) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    onSubmit({
      customerId: form.customerId,
      propertyId: form.propertyId,
     appointmentDate: new Date(form.date).toISOString(), // 🔥 FIX CHÍNH
      status: form.status,
      notes: form.notes,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-[420px] shadow-lg">
        <h2 className="text-lg font-bold mb-4">
          {initialData ? "Cập nhật lịch hẹn" : "Tạo lịch hẹn"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* CUSTOMER */}
          <select
            name="customerId"
            value={form.customerId}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="">Chọn khách hàng</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* PROPERTY */}
          <select
            name="propertyId"
            value={form.propertyId}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="">Chọn bất động sản</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>

          {/* DATE */}
          <input
            type="datetime-local"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          {/* STATUS */}
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value={0}>Scheduled</option>
            <option value={1}>Completed</option>
            <option value={2}>Cancelled</option>
            <option value={3}>No Show</option>
          </select>

          {/* NOTES */}
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Ghi chú..."
            className="w-full border p-2 rounded"
          />

          {/* ACTIONS */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 text-gray-600"
            >
              Huỷ
            </button>

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AppointmentForm;