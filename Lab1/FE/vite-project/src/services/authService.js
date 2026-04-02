import api from "./api";

// ==============================
// LOGIN
// ==============================
export const login = async (username, password) => {
  try {
    const res = await api.post("/Account/login", {
      userName: username,
      password: password,
    });

    console.log("LOGIN RESPONSE:", res.data);

    const { token, user } = res.data;

    if (!token) {
      throw new Error("Không tìm thấy token");
    }

    // ✅ lưu token
    localStorage.setItem("token", token);

    // ✅ lưu user
    localStorage.setItem("user", JSON.stringify(user));

    return token;
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    throw (
      error?.response?.data?.message ||
      error?.response?.data ||
      error.message ||
      "Login failed"
    );
  }
};

// ==============================
// LOGOUT
// ==============================
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user"); // ✅ FIX
  window.location.href = "/login";
};

// ==============================
// GET TOKEN
// ==============================
export const getToken = () => {
  return localStorage.getItem("token");
};

// ==============================
// GET USER (THÊM)
// ==============================
export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

// ==============================
// CHECK LOGIN
// ==============================
export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};