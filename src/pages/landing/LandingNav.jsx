import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";

const LINKS = [
  { label: "Features", href: "#features" },
  { label: "Benefits", href: "#benefits" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
];

export default function LandingNav() {
  const [open, setOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const userMenuRef = useRef(null);
  const { session, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userOpen) return;
    const close = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [userOpen]);

  const handleLogout = async () => {
    setUserOpen(false);
    setOpen(false);
    await logout();
    navigate("/login");
  };

  const brandContent = (
    <>
      <span className="brand__mark" aria-hidden="true"><i className="fa-solid fa-arrow-trend-up"></i></span>
      <span className="brand__text">
        <span className="brand__name">LeadFlow</span>
        <span className="brand__tag">CRM</span>
      </span>
    </>
  );

  const initial = (session?.username || session?.name || "U").charAt(0).toUpperCase();

  return (
    <header className="landing-nav">
      <nav className="landing-container landing-nav__inner" aria-label="Main">
        {session ? (
          <Link className="brand" to="/dashboard" aria-label="LeadFlow CRM dashboard">
            {brandContent}
          </Link>
        ) : (
          <a className="brand" href="#top" aria-label="LeadFlow CRM home">
            {brandContent}
          </a>
        )}

        <div className="landing-nav__links">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href}>{link.label}</a>
          ))}
        </div>

        <div className="landing-nav__actions">
          <button type="button" className="landing-nav__theme" onClick={toggleTheme} aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}>
            <i className={`fa-solid ${theme === "light" ? "fa-moon" : "fa-sun"}`} aria-hidden="true"></i>
          </button>
          {session ? (
            <div className="landing-nav__user" ref={userMenuRef}>
              <button
                type="button"
                className="landing-nav__user-btn"
                aria-expanded={userOpen}
                aria-label="Account menu"
                onClick={() => setUserOpen((v) => !v)}
              >
                <span className="landing-nav__user-avatar" style={{ background: session.avatarColor || "var(--accent)" }}>
                  {initial}
                </span>
              </button>
              <div className={`landing-nav__user-menu${userOpen ? " landing-nav__user-menu--open" : ""}`}>
                <Link to="/dashboard" className="landing-nav__user-link" onClick={() => setUserOpen(false)}>
                  <i className="fa-solid fa-gauge-high" aria-hidden="true"></i>
                  Dashboard
                </Link>
                <button type="button" className="landing-nav__user-link landing-nav__user-link--danger" onClick={handleLogout}>
                  <i className="fa-solid fa-right-from-bracket" aria-hidden="true"></i>
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <>
              <Link className="landing-nav__login" to="/login">Login</Link>
              <Link className="landing-btn landing-btn--primary landing-btn--sm" to="/onboarding">
                Get Started Free <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
              </Link>
            </>
          )}
          <button
            type="button"
            className="landing-nav__burger"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <i className={`fa-solid ${open ? "fa-xmark" : "fa-bars"}`} aria-hidden="true"></i>
          </button>
        </div>
      </nav>

      {open && (
        <div className="landing-nav__mobile landing-nav__mobile--open">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</a>
          ))}
          {session ? (
            <>
              <Link to="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
              <button type="button" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <Link to="/onboarding" onClick={() => setOpen(false)}>Get Started Free</Link>
          )}
        </div>
      )}
    </header>
  );
}
