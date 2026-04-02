import api from "./api";

// ==============================
// GET ALL
// ==============================
export const getAppointments = async (params = {}) => {
  try {
    const res = await api.get("/Appointments", { params });

    // BE trả về dạng: { data: [...] }
    return res.data?.data || [];
  } catch (error) {
    console.error("GET APPOINTMENTS ERROR:", error.response?.data);
    throw error.response?.data || "Lỗi khi lấy danh sách lịch hẹn";
  }
};

// ==============================
// GET BY ID
// ==============================
export const getAppointmentById = async (id) => {
  try {
    const res = await api.get(`/Appointments/${id}`);

    return res.data?.data;
  } catch (error) {
    console.error("GET DETAIL ERROR:", error.response?.data);
    throw error.response?.data || "Lỗi khi lấy chi tiết lịch hẹn";
  }
};

// ==============================
// CREATE
// ==============================
export const createAppointment = async (data) => {
  try {
    const payload = {
      customerId: Number(data.customerId),
      propertyId: Number(data.propertyId),

      // 🔥 QUAN TRỌNG: phải là appointmentDate
      appointmentDate: new Date(data.appointmentDate).toISOString(),

      // 🔥 đúng tên field BE
      notes: data.notes || "",
    };

    console.log("CREATE PAYLOAD:", payload);

    const res = await api.post("/Appointments", payload);

    return res.data?.data;
  } catch (error) {
    console.error("CREATE ERROR:", error.response?.data);
    throw error.response?.data || "Lỗi khi tạo lịch hẹn";
  }
};

// ==============================
// UPDATE
// ==============================
export const updateAppointment = async (id, data) => {
  try {
    const payload = {
      customerId: Number(data.customerId),
      propertyId: Number(data.propertyId),

      appointmentDate: new Date(data.appointmentDate).toISOString(),

      notes: data.notes || "",

      // ⚠️ BE model có status khi update
      status: data.status ?? 0,
    };

    console.log("UPDATE PAYLOAD:", payload);

    const res = await api.put(`/Appointments/${id}`, payload);

    return res.data;
  } catch (error) {
    console.error("UPDATE ERROR:", error.response?.data);
    throw error.response?.data || "Lỗi khi cập nhật lịch hẹn";
  }
};

// ==============================
// DELETE
// ==============================
export const deleteAppointment = async (id) => {
  try {
    const res = await api.delete(`/Appointments/${id}`);

    return res.data;
  } catch (error) {
    console.error("DELETE ERROR:", error.response?.data);
    throw error.response?.data || "Lỗi khi xoá lịch hẹn";
  }
};

// ==============================
// SEARCH
// ==============================
export const searchAppointments = async (
  search,
  page = 1,
  pageSize = 10
) => {
  try {
    const res = await api.get("/Appointments/search", {
      params: {
        search,      // ✅ đúng tên BE cần
        page,
        pageSize,
      },
    });

    return res.data?.data || res.data || [];
  } catch (error) {
    console.error("Search appointments error:", error.response?.data);
    throw error.response?.data || "Lỗi khi tìm kiếm lịch hẹn";
  }
};

export default {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  searchAppointments,
};