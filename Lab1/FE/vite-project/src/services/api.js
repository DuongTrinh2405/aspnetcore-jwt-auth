import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5117/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ================================
// REQUEST INTERCEPTOR
// ================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    // 🔥 DEBUG (quan trọng)
    console.log("TOKEN:", token);

    if (token && token !== "null" && token !== "undefined") {
      config.headers.Authorization = `Bearer ${token}`;
    }

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
      console.error("API ERROR:", error.response.status, error.response.data);
    } else {
      console.error("NETWORK ERROR:", error.message);
    }

    // ❗ chỉ logout nếu thực sự có token
    if (error.response?.status === 401) {
      const token = localStorage.getItem("token");

      if (token) {
        localStorage.removeItem("token");
        window.location.replace("/");
      }
    }

    return Promise.reject(error);
  }
);

export default api;