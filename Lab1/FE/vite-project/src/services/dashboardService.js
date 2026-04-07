import api from "./api";

export const getDashboard = async () => {
  try {
    const res = await api.get("/Dashboard");
    return res.data?.data || {};
  } catch (error) {
    console.error("Get dashboard error:", error.response?.data || error);
    throw error.response?.data || { message: "Lỗi khi lấy dữ liệu dashboard" };
  }
};

export default {
  getDashboard,
};
