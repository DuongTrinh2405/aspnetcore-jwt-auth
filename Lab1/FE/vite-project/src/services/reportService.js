import api from "./api";

export const getReport = async (employeeId) => {
  try {
    const res = await api.get("/Reports", {
      params: {
        employeeId: employeeId || undefined,
      },
    });

    return res.data?.data || {};
  } catch (error) {
    console.error("Get report error:", error.response?.data || error);
    throw error.response?.data || { message: "Lỗi khi lấy báo cáo" };
  }
};

export default {
  getReport,
};
