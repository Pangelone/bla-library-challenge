import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, logout, isLibrarian } = useAuth();

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">BLA Library Challenge</p>
          <h1>Library Manager</h1>
        </div>
        <div className="topbar-actions">
          <span className="user-chip">
            {user.name} · {user.role}
          </span>
          <button type="button" className="btn ghost" onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      <nav className="nav">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/books">Books</NavLink>
        <NavLink to="/borrowings">Borrowings</NavLink>
        {isLibrarian && <span className="nav-note">Librarian mode</span>}
      </nav>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
