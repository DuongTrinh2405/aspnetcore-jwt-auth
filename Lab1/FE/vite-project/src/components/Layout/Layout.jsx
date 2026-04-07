import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

function Layout() {
  return (
    <div className="flex min-h-screen w-full app-shell">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <div className="flex-1 flex flex-col">
        {/* HEADER */}
        <Header />

        {/* CONTENT */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="w-full min-h-full app-card p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Layout;