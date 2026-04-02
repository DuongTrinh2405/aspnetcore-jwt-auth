import api from "./api";

const unwrap = (res) => res.data?.data ?? res.data ?? [];

// ==============================
// GET ALL
// ==============================
export const getEmployees = async (params = {}) => {
  try {
    const res = await api.get("/Employees", { params });
    return unwrap(res);
  } catch (error) {
    console.error("GET EMPLOYEES ERROR:", error.response?.data);
    throw error; // 🔥 FIX
  }
};

// ==============================
// GET BY ID
// ==============================
export const getEmployeeById = async (id) => {
  try {
    const res = await api.get(`/Employees/${id}`);
    return res.data?.data ?? res.data;
  } catch (error) {
    console.error("GET EMPLOYEE DETAIL ERROR:", error.response?.data);
    throw error; // 🔥 FIX
  }
};

// ==============================
// BUILD PAYLOAD
// ==============================
const buildPayload = (data) => {
  return {
    name: data.name?.trim(),
    email: data.email?.trim(),
    phone: data.phone?.trim() || "",
    role: Number(data.role),
    status: Number(data.status),
    password: data.password,
  };
};

// ==============================
// CREATE
// ==============================
export const createEmployee = async (data) => {
  try {
    const payload = buildPayload(data);

    console.log("CREATE PAYLOAD:", payload);

    const res = await api.post("/Employees", payload);
    return res.data?.data ?? res.data;
  } catch (error) {
    console.error("CREATE ERROR:", error.response?.data);
    throw error; // 🔥 FIX QUAN TRỌNG
  }
};

// ==============================
// UPDATE
// ==============================
export const updateEmployee = async (id, data) => {
  try {
    const payload = buildPayload(data);

    console.log("UPDATE PAYLOAD:", payload);

    const res = await api.put(`/Employees/${id}`, payload);
    return res.data?.data ?? res.data;
  } catch (error) {
    console.error("UPDATE ERROR:", error.response?.data);
    throw error; // 🔥 FIX QUAN TRỌNG
  }
};

// ==============================
// DELETE
// ==============================
export const deleteEmployee = async (id) => {
  try {
    const res = await api.delete(`/Employees/${id}`);
    return res.data?.data ?? res.data;
  } catch (error) {
    console.error("DELETE ERROR:", error.response?.data);
    throw error; // 🔥 FIX
  }
};

// ==============================
// MAP ENUM → STRING
// ==============================
const mapRole = (role) => {
  if (role === 1) return "Admin";
  if (role === 2) return "Staff";
  return undefined;
};

const mapStatus = (status) => {
  if (status === 1) return "Active";
  if (status === 2) return "Inactive";
  return undefined;
};

// ==============================
// SEARCH
// ==============================
export const searchEmployees = async (query, params = {}) => {
  try {
    const finalParams = {
      query: query || undefined,
      role: mapRole(params.role),
      status: mapStatus(params.status),
      fromDate: params.fromDate,
      toDate: params.toDate,
    };

    console.log("SEARCH PARAMS:", finalParams);

    const res = await api.get("/Employees/search", {
      params: finalParams,
    });

    return unwrap(res);
  } catch (error) {
    console.error("SEARCH ERROR:", error.response?.data);
    throw error; // 🔥 FIX
  }
};

export default {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  searchEmployees,
};