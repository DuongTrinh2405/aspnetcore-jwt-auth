import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

function Layout() {
  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <div className="flex-1 flex flex-col">
        {/* HEADER */}
        <Header />

        {/* CONTENT */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="w-full min-h-full bg-white rounded-2xl shadow-lg p-6 border border-slate-200/50">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Layout;