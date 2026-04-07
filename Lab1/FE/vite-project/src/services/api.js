import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5117/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// ================================
// HELPER: CHECK TOKEN EXPIRED
// ================================
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch (err) {
    return true;
  }
};

// ================================
// REQUEST INTERCEPTOR
// ================================
api.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem("token");

    // 🔥 remove dấu " nếu có
    if (token) {
      token = token.replace(/^"|"$/g, "");
    }

    config.headers = config.headers || {};

    // ✅ If this request uses FormData, remove the JSON content type so axios can set multipart boundary correctly
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    // ❗ check token hợp lệ + chưa hết hạn
    if (
      token &&
      token !== "null" &&
      token !== "undefined" &&
      !isTokenExpired(token)
    ) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
      localStorage.removeItem("token");
    }

    // DEBUG (có thể xoá sau)
    console.log("👉 REQUEST:", config.url);
    console.log("👉 TOKEN:", token);

    return config;
  },
  (error) => Promise.reject(error)
);

// ================================
// RESPONSE INTERCEPTOR
// ================================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(
        "❌ API ERROR:",
        error.response.status,
        error.response.data
      );
    } else {
      console.error("❌ NETWORK ERROR:", error.message);
    }

    // 🔥 FIX QUAN TRỌNG: handle 401
    if (error.response?.status === 401) {
      console.warn("⚠️ Token hết hạn hoặc không hợp lệ → logout");

      localStorage.removeItem("token");

      // tránh redirect loop
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;