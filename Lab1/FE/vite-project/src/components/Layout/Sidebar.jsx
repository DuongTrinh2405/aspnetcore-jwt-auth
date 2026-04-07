import { NavLink } from "react-router-dom";
import { ROUTES } from "../../utils/constants";

function Sidebar() {
  // 👉 tránh crash nếu chưa login
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const menu = [
    { label: "Dashboard", path: ROUTES.DASHBOARD, icon: "🏠" },
    { label: "Customers", path: ROUTES.CUSTOMERS, icon: "👥" },
    { label: "Properties", path: ROUTES.PROPERTIES, icon: "🏡" },
    { label: "Deals", path: ROUTES.DEALS, icon: "💰" },
    { label: "Appointments", path: ROUTES.APPOINTMENTS, icon: "📅" },
    { label: "Reports", path: ROUTES.REPORTS, icon: "📊" },

    // ✅ THÊM PROFILE (ai cũng xem được)
    { label: "Profile", path: ROUTES.PROFILE, icon: "👤" },

    // 👉 chỉ Admin mới có
    { label: "Employees", path: ROUTES.EMPLOYEES, icon: "👨‍💼", role: "Admin" },
  ];

  // 👉 filter theo role (an toàn khi user null)
  const filteredMenu = menu.filter(
    (item) => !item.role || item.role === user?.role
  );

  return (
    <div className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col p-5 shadow-2xl">
      <div className="text-center mb-8">
        <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          CRM
        </div>
      </div>

      {/* 👉 thông tin user nhỏ phía trên (xịn hơn) */}
      {user && (
        <div className="mb-6 px-3 py-2 bg-slate-800/50 rounded-xl text-sm">
          <div className="font-semibold">{user.name}</div>
          <div className="text-slate-400 text-xs">{user.role}</div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {filteredMenu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                  : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
              }`
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;