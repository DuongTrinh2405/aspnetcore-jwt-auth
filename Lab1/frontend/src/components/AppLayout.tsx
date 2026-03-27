import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { logout } from '../services/auth'

export function AppLayout() {
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="brand">
          CRM Frontend
        </Link>
        <button onClick={handleLogout} className="btn btn-danger">
          Logout
        </button>
      </header>
      <div className="main-grid">
        <aside className="sidebar">
          <NavLink to="/" end className="nav-item">
            Dashboard
          </NavLink>
          <NavLink to="/deals" className="nav-item">
            Deals
          </NavLink>
        </aside>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
