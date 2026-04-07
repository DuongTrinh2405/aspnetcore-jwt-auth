import { Routes, Route, Navigate } from "react-router-dom";

// pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Properties from "./pages/Properties";
import Deals from "./pages/Deals";
import Appointments from "./pages/Appointments";
import Reports from "./pages/Reports";
import Employees from "./pages/Employees";
import Profile from "./pages/profile";

// layout
import Layout from "./components/Layout/Layout";

// constants
import { ROUTES } from "./utils/constants";

// ==============================
// PRIVATE ROUTE
// ==============================
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return children;
};

// ==============================
// APP
// ==============================
function App() {
  return (
    <Routes>
      {/* LOGIN */}
      <Route path={ROUTES.LOGIN} element={<Login />} />

      {/* PROTECTED */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />

        <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
        <Route path={ROUTES.CUSTOMERS} element={<Customers />} />
        <Route path={ROUTES.PROPERTIES} element={<Properties />} />
        <Route path={ROUTES.DEALS} element={<Deals />} />
        <Route path={ROUTES.APPOINTMENTS} element={<Appointments />} />
        <Route path={ROUTES.REPORTS} element={<Reports />} />

        {/* 🔥 FIX QUAN TRỌNG */}
        <Route path="/employees" element={<Employees />} />
        <Route path="/employees/:id" element={<Employees />} />

        <Route path={ROUTES.PROFILE} element={<Profile />} />
      </Route>

      {/* fallback */}
      <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
    </Routes>
  );
}

export default App;