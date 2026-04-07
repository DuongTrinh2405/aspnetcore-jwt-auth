import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />

      <main className="app-shell-content">
        {children}
      </main>
    </div>
  );
}