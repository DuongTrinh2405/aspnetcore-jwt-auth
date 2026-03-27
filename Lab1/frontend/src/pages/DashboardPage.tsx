export function DashboardPage() {
  return (
    <section>
      <h2>Dashboard</h2>
      <p>Frontend is connected to your ASP.NET Core CRM backend.</p>
      <div className="stat-grid">
        <div className="card">
          <h3>Authentication</h3>
          <p>JWT login and protected routes are active.</p>
        </div>
        <div className="card">
          <h3>Module Ready</h3>
          <p>Deals page can list and create deal records.</p>
        </div>
      </div>
    </section>
  )
}
