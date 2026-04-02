import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div style={{
      width: "200px",
      height: "100vh",
      background: "#111",
      color: "#fff",
      padding: "20px"
    }}>
      <h3>CRM</h3>

      <div>
        <Link to="/dashboard" style={{ color: "#fff" }}>Dashboard</Link>
      </div>

      <div>
        <Link to="/customers" style={{ color: "#fff" }}>Customers</Link>
      </div>
    </div>
  );
}