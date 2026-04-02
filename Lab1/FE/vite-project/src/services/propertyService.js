import api from "./api";

// ==============================
// GET ALL
// ==============================
export const getProperties = async () => {
  try {
    const res = await api.get("/Properties");
    return res.data.data;
  } catch (error) {
    console.error("Get properties error:", error.response?.data);
    throw error.response?.data;
  }
};

// ==============================
// GET BY ID
// ==============================
export const getPropertyById = async (id) => {
  try {
    const res = await api.get(`/Properties/${id}`);
    return res.data.data;
  } catch (error) {
    console.error("Get property detail error:", error.response?.data);
    throw error.response?.data || "Lỗi khi lấy chi tiết property";
  }
};

// ==============================
// CREATE
// ==============================
export const createProperty = async (data) => {
  try {
    const payload = {
      title: data.title,
      price: Number(data.price),
      area: Number(data.area),
      address: data.address,
      description: data.description,
      type: data.type,
      status: data.status,
      isSold: data.isSold ?? false,
      imageUrl: data.imageUrl || "",
    };

    const res = await api.post("/Properties", payload);
    return res.data.data;
  } catch (error) {
    console.error("CREATE ERROR:", error.response?.data);
    throw error.response?.data;
  }
};

// ==============================
// UPDATE
// ==============================
export const updateProperty = async (id, data) => {
  try {
    const payload = {
      title: data.title,
      price: Number(data.price),
      area: Number(data.area),
      address: data.address,
      description: data.description,
      type: data.type,
      status: data.status,
      isSold: data.isSold ?? false,
      imageUrl: data.imageUrl || "",
    };

    await api.put(`/Properties/${id}`, payload);
  } catch (error) {
    console.error("UPDATE ERROR:", error.response?.data);
    throw error.response?.data;
  }
};

// ==============================
// DELETE
// ==============================
export const deleteProperty = async (id) => {
  await api.delete(`/Properties/${id}`);
};

// ==============================
// UPLOAD IMAGE
// ==============================
export const uploadPropertyImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post("/Upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data.url;
};

// ==============================
// SEARCH
// ==============================
export const searchProperties = async (query, params = {}) => {
  try {
    const res = await api.get("/Properties/search", {
      params: { query, ...params }
    });
    return res.data.data;
  } catch (error) {
    console.error("Search properties error:", error.response?.data);
    throw error.response?.data || "Lỗi khi tìm kiếm bất động sản";
  }
};

// ==============================
// EXPORT DEFAULT
// ==============================
export default {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  uploadPropertyImage,
  searchProperties,
};