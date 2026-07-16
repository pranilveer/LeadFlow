import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

export default function Layout({ activePage, children }) {
  const { session, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setDropdownOpen(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const handleSidebarToggle = () => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  useEffect(() => {
    if (sidebarOpen) document.body.classList.add("sidebar-open");
    else document.body.classList.remove("sidebar-open");
    return () => document.body.classList.remove("sidebar-open");
  }, [sidebarOpen]);

  if (!session) return null;

  const navItems = [
    { to: "/dashboard", icon: "fa-gauge-high", label: "Dashboard", page: "dashboard" },
    { to: "/categories", icon: "fa-tags", label: "Categories", page: "categories" },
    { to: "/users", icon: "fa-users", label: "Users", page: "users", adminOnly: true },
    { to: "/settings", icon: "fa-gear", label: "Settings", page: "settings" },
    { to: "/profile", icon: "fa-user", label: "Profile", page: "profile" },
  ].filter(item => !item.adminOnly || isAdmin);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initial = session.username?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="app-body light">
      <div className={`sidebar-overlay ${sidebarOpen ? "" : ""}`} onClick={() => setSidebarOpen(false)}></div>
      <aside className={`sidebar ${sidebarCollapsed ? "sidebar--collapsed" : ""}`} aria-label="Main navigation">
        <div className="sidebar__header">
          <NavLink className="brand" to="/dashboard">
            <span className="brand__mark"><i className="fa-solid fa-bolt"></i></span>
            <span className="brand__text">
              <span className="brand__name">LeadFlow</span>
              <span className="brand__tag">CRM</span>
            </span>
          </NavLink>
        </div>
        <nav className="sidebar-nav" aria-label="Sidebar links">
          {navItems.map(item => (
            <NavLink
              key={item.page}
              to={item.to}
              className={({ isActive }) => `sidebar-nav__link ${isActive ? "sidebar-nav__link--active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <i className={`fa-solid ${item.icon}`} aria-hidden="true"></i>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar__footer">LeadFlow CRM v1.0</div>
      </aside>

      <div className="app-main">
        <header className="navbar">
          <button type="button" className="btn btn--ghost btn--icon sidebar-toggle" onClick={handleSidebarToggle} aria-label="Toggle sidebar">
            <i className={`fa-solid ${sidebarCollapsed ? "fa-angles-right" : "fa-bars"}`}></i>
          </button>

          <div className="navbar__search">
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
            <input type="search" placeholder={`Search ${activePage}\u2026`} aria-label="Search" disabled />
          </div>

          <div className="navbar__actions">
            <button type="button" className="btn btn--ghost btn--icon" onClick={toggleTheme} aria-label="Toggle theme">
              <i className={`fa-solid ${theme === "light" ? "fa-moon" : "fa-sun"}`}></i>
            </button>

            <div className="user-menu" ref={dropdownRef}>
              <button type="button" className="user-menu__btn" aria-expanded={dropdownOpen} aria-haspopup="true" onClick={(e) => { e.stopPropagation(); setDropdownOpen(!dropdownOpen); }}>
                <span className="user-avatar" style={{ background: session.avatarColor || "var(--accent)" }}>{initial}</span>
                <span className="user-menu__info">
                  <span className="user-menu__name">{session.name || session.username}</span>
                  <span className="user-menu__role">{isAdmin ? "Administrator" : "Team Member"}</span>
                </span>
                <i className="fa-solid fa-chevron-down" style={{ fontSize: "0.65rem", color: "var(--text-faint)" }}></i>
              </button>
              <div className={`user-dropdown ${dropdownOpen ? "user-dropdown--open" : ""}`} role="menu">
                <div className="user-dropdown__header">
                  <span className="user-avatar" style={{ background: session.avatarColor || "var(--accent)" }}>{initial}</span>
                  <div>
                    <div className="user-dropdown__name">{session.name || session.username}</div>
                    <div className="user-dropdown__email">{session.email || ""}</div>
                  </div>
                </div>
                <NavLink to="/profile" className="user-dropdown__link" role="menuitem" onClick={() => setDropdownOpen(false)}>
                  <i className="fa-solid fa-user"></i> Profile
                </NavLink>
                <NavLink to="/settings" className="user-dropdown__link" role="menuitem" onClick={() => setDropdownOpen(false)}>
                  <i className="fa-solid fa-gear"></i> Settings
                </NavLink>
                <button type="button" className="user-dropdown__link user-dropdown__link--danger" role="menuitem" onClick={handleLogout}>
                  <i className="fa-solid fa-right-from-bracket"></i> Log out
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}
