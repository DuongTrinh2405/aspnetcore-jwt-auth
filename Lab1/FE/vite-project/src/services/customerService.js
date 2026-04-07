import api from "./api";

// ==============================
// GET ALL + SEARCH + FILTER + PAGINATION
// ==============================
export const getCustomers = async (params = {}) => {
  try {
    const res = await api.get("/Customers", { params });

    return {
      data: res.data.data || [],
      total: res.data.total || 0,
      page: res.data.page || 1,
      pageSize: res.data.pageSize || 10,
      totalPages: res.data.totalPages || 1, // 🔥 FIX QUAN TRỌNG
    };
  } catch (error) {
    console.error("Get customers error:", error.response?.data);
    throw error.response?.data || "Lỗi khi lấy danh sách khách hàng";
  }
};

// ==============================
// GET BY ID
// ==============================
export const getCustomerById = async (id) => {
  try {
    const res = await api.get(`/Customers/${id}`);
    return res.data.data;
  } catch (error) {
    console.error("Get detail error:", error.response?.data);
    throw error.response?.data || "Lỗi khi lấy chi tiết khách hàng";
  }
};

// ==============================
// CREATE
// ==============================
export const createCustomer = async (data) => {
  try {
    const payload = {
      name: data.name,
      phone: data.phone || "",
      email: data.email || "",
      address: data.address || "",
      lastContactDate: data.lastContactDate || null,
    };

    const res = await api.post("/Customers", payload);
    return res.data.data;
  } catch (error) {
    console.error("CREATE ERROR:", error.response?.data);
    throw error.response?.data || "Lỗi khi tạo khách hàng";
  }
};

// ==============================
// UPDATE
// ==============================
export const updateCustomer = async (id, data) => {
  try {
    const payload = {
      name: data.name,
      phone: data.phone || "",
      email: data.email || "",
      address: data.address || "",
      status: data.status,
      lastContactDate: data.lastContactDate || null,
    };

    const res = await api.put(`/Customers/${id}`, payload);
    return res.data;
  } catch (error) {
    console.error("UPDATE ERROR:", error.response?.data);
    throw error.response?.data || "Lỗi khi cập nhật khách hàng";
  }
};

// ==============================
// DELETE
// ==============================
export const deleteCustomer = async (id) => {
  try {
    const res = await api.delete(`/Customers/${id}`);
    return res.data;
  } catch (error) {
    console.error("DELETE ERROR:", error.response?.data);
    throw error.response?.data || "Lỗi khi xoá khách hàng";
  }
};

// ==============================
// EXPORT
// ==============================
export default {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};