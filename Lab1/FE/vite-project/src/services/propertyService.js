import api from "./api";

// ==============================
// HELPER: clean params
// ==============================
const cleanParams = (params) => {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([_, v]) => v !== "" && v !== null && v !== undefined
    )
  );
};

// ==============================
// 🔥 ENUM MAP (FIX CHÍNH)
// ==============================
const typeMap = {
  Apartment: 0,
  House: 1,
};

const statusMap = {
  Available: 0,
  Sold: 1,
};

// ==============================
// 🔥 HELPER: CLEAN IMAGE URLS (QUAN TRỌNG NHẤT)
// ==============================
const normalizeImages = (imageUrls) => {
  if (!imageUrls) return [];

  // nếu là string
  if (typeof imageUrls === "string") {
    return imageUrls.split(",").filter((url) => url.trim());
  }

  // nếu là array
  if (Array.isArray(imageUrls)) {
    return imageUrls.map((img) => {
      // nếu là string
      if (typeof img === "string") return img;

      // nếu là object { id, imageUrl }
      if (img && typeof img === "object") {
        return img.imageUrl;
      }

      return "";
    }).filter(Boolean);
  }

  return [];
};

// ==============================
// GET ALL
// ==============================
export const getProperties = async (params = {}) => {
  try {
    const queryParams = cleanParams({
      search: params.search || "",
      type:
        typeof params.type === "string"
          ? typeMap[params.type]
          : params.type || "",
      status:
        typeof params.status === "string"
          ? statusMap[params.status]
          : params.status || "",
      minPrice: params.minPrice ? Number(params.minPrice) : "",
      maxPrice: params.maxPrice ? Number(params.maxPrice) : "",
      page: params.page || 1,
      pageSize: params.pageSize || 10,
      sortBy: params.sortBy || "",
      sortOrder: params.sortOrder || "",
    });

    const res = await api.get("/Properties", {
      params: queryParams,
    });

    return {
      data: res.data.data || [],
      total: res.data.total || 0,
      page: res.data.page || 1,
    };
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
// CREATE (🔥 FIX IMAGE + ENUM)
// ==============================
export const createProperty = async (data) => {
  try {
    const payload = {
      title: data.title,
      price: Number(data.price),
      area: Number(data.area),
      address: data.address,
      description: data.description,

      type:
        typeof data.type === "string"
          ? typeMap[data.type]
          : data.type,

      status:
        typeof data.status === "string"
          ? statusMap[data.status]
          : data.status,

      // 🔥 FIX QUAN TRỌNG
      imageUrls: normalizeImages(data.imageUrls),
    };

    const res = await api.post("/Properties", payload);
    return res.data.data;
  } catch (error) {
    console.error("CREATE ERROR:", error.response?.data);
    throw error.response?.data;
  }
};

// ==============================
// UPDATE (🔥 FIX IMAGE + ENUM)
// ==============================
export const updateProperty = async (id, data) => {
  try {
    const payload = {
      title: data.title,
      price: Number(data.price),
      area: Number(data.area),
      address: data.address,
      description: data.description,

      type:
        typeof data.type === "string"
          ? typeMap[data.type]
          : data.type,

      status:
        typeof data.status === "string"
          ? statusMap[data.status]
          : data.status,

      // 🔥 FIX QUAN TRỌNG
      imageUrls: normalizeImages(data.imageUrls),
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
  try {
    await api.delete(`/Properties/${id}`);
  } catch (error) {
    console.error("DELETE ERROR:", error.response?.data);
    throw error.response?.data;
  }
};

// ==============================
// UPLOAD IMAGE
// ==============================
export const uploadPropertyImages = async (files) => {
  try {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("files", file);
    });

    const res = await api.post("/Upload", formData);

    return res.data.urls;
  } catch (error) {
    console.error("UPLOAD ERROR:", error.response?.data);
    throw error.response?.data;
  }
};

// ==============================
export default {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  uploadPropertyImages,
};