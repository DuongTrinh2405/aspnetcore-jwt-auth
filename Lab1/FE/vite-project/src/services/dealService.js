import api from "./api";

// ==============================
// HELPER: safe number
// ==============================
const toNumber = (val, defaultVal = null) => {
  if (val === "" || val === null || val === undefined) return defaultVal;
  const num = Number(val);
  return isNaN(num) ? defaultVal : num;
};

// ==============================
// GET ALL DEALS
// ==============================
export const getDeals = async (params = {}) => {
  try {
    const res = await api.get("/Deals", { params });
    return res.data?.data || [];
  } catch (error) {
    console.error("Get deals error:", error.response?.data);
    throw error.response?.data || { message: "Lỗi khi lấy danh sách deals" };
  }
};

// ==============================
// GET DEAL BY ID
// ==============================
export const getDealById = async (id) => {
  try {
    const res = await api.get(`/Deals/${id}`);
    return res.data?.data || null;
  } catch (error) {
    console.error("Get deal detail error:", error.response?.data);
    throw error.response?.data || { message: "Lỗi khi lấy chi tiết deal" };
  }
};

// ==============================
// CREATE DEAL (CLEAN PAYLOAD)
// ==============================
export const createDeal = async (data) => {
  try {
    const payload = {
      title: data.title,
      amount: toNumber(data.amount, 0),

      // ✅ luôn là number
      stage: toNumber(data.stage, 0),
      status: toNumber(data.status, 0),

      customerId: toNumber(data.customerId),
      propertyId: toNumber(data.propertyId),

      expectedCloseDate: data.expectedCloseDate || null,
      closedDate: data.closedDate || null,

      notes: data.notes || "",
    };

    const res = await api.post("/Deals", payload);
    return res.data?.data;
  } catch (error) {
    console.error("Create deal error:", error.response?.data);

    throw (
      error.response?.data || {
        message: "Lỗi khi tạo deal",
      }
    );
  }
};

// ==============================
// UPDATE DEAL (CLEAN PAYLOAD)
// ==============================
export const updateDeal = async (id, data) => {
  try {
    const payload = {
      title: data.title,
      amount: toNumber(data.amount, 0),

      stage: toNumber(data.stage, 0),
      status: toNumber(data.status, 0),

      customerId: toNumber(data.customerId),
      propertyId: toNumber(data.propertyId),

      expectedCloseDate: data.expectedCloseDate || null,
      closedDate: data.closedDate || null,

      notes: data.notes || "",
    };

    const res = await api.put(`/Deals/${id}`, payload);
    return res.data;
  } catch (error) {
    console.error("Update deal error:", error.response?.data);

    throw (
      error.response?.data || {
        message: "Lỗi khi cập nhật deal",
      }
    );
  }
};

// ==============================
// CLOSE DEAL (CHUẨN NUMBER)
// ==============================
export const closeDeal = async (deal) => {
  try {
    const payload = {
      ...deal,
      stage: 4,   // WON
      status: 2,  // WON
      closedDate: new Date().toISOString(),
    };

    return await updateDeal(deal.id, payload);
  } catch (error) {
    console.error("Close deal error:", error.response?.data);

    throw (
      error.response?.data || {
        message: "Lỗi khi đóng deal",
      }
    );
  }
};

// ==============================
// DELETE DEAL
// ==============================
export const deleteDeal = async (id) => {
  try {
    const res = await api.delete(`/Deals/${id}`);
    return res.data;
  } catch (error) {
    console.error("Delete deal error:", error.response?.data);

    throw (
      error.response?.data || {
        message: "Lỗi khi xoá deal",
      }
    );
  }
};

// ==============================
// SEARCH DEALS
// ==============================
export const searchDeals = async (query, params = {}) => {
  try {
    const res = await api.get("/Deals/search", {
      params: {
        query,
        ...params,
      },
    });
    return res.data?.data || [];
  } catch (error) {
    console.error("Search deals error:", error.response?.data);

    throw (
      error.response?.data || {
        message: "Lỗi khi tìm kiếm deals",
      }
    );
  }
};

export default {
  getDeals,
  getDealById,
  createDeal,
  updateDeal,
  closeDeal,
  deleteDeal,
  searchDeals,
};