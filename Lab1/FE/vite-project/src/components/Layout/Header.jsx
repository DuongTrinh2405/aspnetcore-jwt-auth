import { logout } from "../../services/authService";

function Header() {
  // 👉 lấy user từ localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc muốn đăng xuất?")) {
      logout();
    }
  };

  return (
    <div className="h-16 bg-white border-b border-slate-200 flex justify-between items-center px-6 shadow-sm">
      {/* LEFT */}
      <h2 className="text-xl font-semibold text-slate-800">
        Dashboard
      </h2>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-lg border border-slate-200">
          
          {/* Avatar */}
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>

          {/* Role hiển thị */}
          <span className="font-medium text-slate-700">
  {user?.role === "Admin"
    ? "Admin"
    : user?.role === "Staff"
    ? "Staff"
    : "Staff"}
</span>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium hover:from-red-600 hover:to-red-700 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Header;