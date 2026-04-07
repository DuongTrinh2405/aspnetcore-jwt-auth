import api from "./api";

// ==============================
// HELPER: normalize response
// ==============================
const normalizeListResponse = (res, params = {}) => {
  return {
    data: res.data?.data || [],
    total: res.data?.total ?? 0,
    page: res.data?.page ?? params.page ?? 1,
    pageSize: res.data?.pageSize ?? params.pageSize ?? 10,
  };
};

// ==============================
// GET ALL (🔥 FIX: USE FILTER API)
// ==============================
export const getAppointments = async ({
  page = 1,
  pageSize = 10,
  search = "",
  status,
  customerId,
  propertyId,
  fromDate,
  toDate,
} = {}) => {
  try {
    // 🔥 FIX: dùng payload thay vì params
    const payload = {
      page,
      pageSize,

      // SEARCH
      keyword: search || undefined,

      // FILTER
      filterStatus:
        status !== "" && status !== undefined
          ? Number(status)
          : undefined,

      filterCustomerId: customerId
        ? Number(customerId)
        : undefined,

      filterPropertyId: propertyId
        ? Number(propertyId)
        : undefined,

      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
    };

    console.log("FILTER PAYLOAD:", payload);

    // 🔥 FIX: POST thay vì GET
    const res = await api.post("/Appointments/filter", payload);

    return normalizeListResponse(res, payload);
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
      dateTime: new Date(data.dateTime).toISOString(),
      status: data.status ?? 0,
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
      ...(data.customerId && {
        customerId: Number(data.customerId),
      }),

      ...(data.propertyId && {
        propertyId: Number(data.propertyId),
      }),

      ...(data.dateTime && {
        dateTime: new Date(data.dateTime).toISOString(),
      }),

      ...(data.notes !== undefined && {
        notes: data.notes,
      }),

      ...(data.status !== undefined && {
        status: data.status,
      }),
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

export default {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
};