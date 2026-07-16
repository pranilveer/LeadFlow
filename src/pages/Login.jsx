import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

const DEMO_ACCOUNTS = [
  { username: "Admin", password: "Admin@123", role: "Full access \u00b7 users & settings", color: "#60A5FA", initial: "A", avatarClass: "demo-account__avatar--admin" },
  { username: "John", password: "John@123", role: "Standard user \u00b7 own leads", color: "#34D399", initial: "J", avatarClass: "demo-account__avatar--john" },
  { username: "Sarah", password: "Sarah@123", role: "Standard user \u00b7 own leads", color: "#C084FC", initial: "S", avatarClass: "demo-account__avatar--sarah" },
];

export default function Login() {
  const { session, login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) navigate("/dashboard", { replace: true });
  }, [session, navigate]);

  useEffect(() => {
    const remembered = localStorage.getItem("leadflow_remember_user");
    if (remembered) { setUsername(remembered); setRememberMe(true); }
  }, []);

  useEffect(() => {
    if (!rememberMe) localStorage.removeItem("leadflow_remember_user");
  }, [rememberMe]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!username.trim()) { setError("Username is required."); return; }
    if (!password) { setError("Password is required."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }

    setLoading(true);
    setTimeout(() => {
      const s = login(username, password, rememberMe);
      if (!s) {
        setError("Invalid username or password. Try a demo account below.");
        setLoading(false);
        return;
      }
      if (rememberMe) localStorage.setItem("leadflow_remember_user", username.trim());
      navigate("/dashboard", { replace: true });
    }, 400);
  };

  const fillDemo = (demo) => {
    setUsername(demo.username);
    setPassword(demo.password);
    setError("");
  };

  return (
    <div className="auth-body light">
      <div className="auth-atmosphere" aria-hidden="true">
        <div className="auth-atmosphere__orb auth-atmosphere__orb--one"></div>
        <div className="auth-atmosphere__orb auth-atmosphere__orb--two"></div>
        <div className="auth-atmosphere__orb auth-atmosphere__orb--three"></div>
        <div className="auth-atmosphere__grid"></div>
      </div>

      <header className="auth-topbar">
        <span className="brand brand--compact">
          <span className="brand__mark" aria-hidden="true"><i className="fa-solid fa-bolt"></i></span>
          <span className="brand__text">
            <span className="brand__name">LeadFlow</span>
            <span className="brand__tag">CRM</span>
          </span>
        </span>
        <div className="auth-topbar__actions">
          <button type="button" className="btn btn--ghost btn--icon" onClick={toggleTheme} aria-label="Toggle dark mode">
            <i className={`fa-solid ${theme === "light" ? "fa-moon" : "fa-sun"}`}></i>
          </button>
        </div>
      </header>

      <main className="auth-main">
        <section className="auth-showcase" aria-labelledby="showcaseHeading">
          <div className="auth-showcase__content">
            <p className="eyebrow">Lead management, refined</p>
            <h1 id="showcaseHeading" className="auth-showcase__title">
              Run your pipeline with the clarity of a modern SaaS workspace.
            </h1>
            <p className="auth-showcase__subtitle">
              Capture leads, organize categories, collaborate with your team, and keep every activity
              auditable \u2014 all from one polished control center.
            </p>
            <ul className="auth-feature-list" role="list">
              <li className="auth-feature-list__item">
                <span className="auth-feature-list__icon" aria-hidden="true"><i className="fa-solid fa-chart-line"></i></span>
                <div><strong>Live pipeline metrics</strong><span>Animated counters, filters, and export-ready grids.</span></div>
              </li>
              <li className="auth-feature-list__item">
                <span className="auth-feature-list__icon" aria-hidden="true"><i className="fa-solid fa-shield-halved"></i></span>
                <div><strong>Role-aware access</strong><span>Admin controls users; teammates manage their own leads.</span></div>
              </li>
              <li className="auth-feature-list__item">
                <span className="auth-feature-list__icon" aria-hidden="true"><i className="fa-solid fa-clock-rotate-left"></i></span>
                <div><strong>Activity &amp; backups</strong><span>Timeline history plus one-click backup and restore.</span></div>
              </li>
            </ul>
          </div>
        </section>

        <section className="auth-panel-wrap" aria-labelledby="signInHeading">
          <div className="glass-card auth-panel">
            <div className="auth-panel__header">
              <h2 id="signInHeading" className="auth-panel__title">Sign in</h2>
              <p className="auth-panel__subtitle">Use a demo account below, or enter credentials stored in this browser session.</p>
            </div>

            {error && (
              <div className="alert alert--error" role="alert" aria-live="assertive">
                <i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i>
                <span>{error}</span>
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <div className="form-field">
                <label className="form-label" htmlFor="username">
                  Username <span className="form-label__required" aria-hidden="true">*</span>
                </label>
                <div className="input-shell">
                  <span className="input-shell__icon" aria-hidden="true"><i className="fa-regular fa-user"></i></span>
                  <input className="form-input" type="text" id="username" placeholder="Enter username" autoComplete="username" required spellCheck="false" value={username} onChange={e => setUsername(e.target.value)} />
                </div>
                <p className="form-hint">Demo users: Admin, John, Sarah</p>
              </div>

              <div className="form-field">
                <div className="form-label-row">
                  <label className="form-label" htmlFor="password">
                    Password <span className="form-label__required" aria-hidden="true">*</span>
                  </label>
                  <button type="button" className="link-btn" onClick={() => setShowPassword(!showPassword)}>
                    <i className={`fa-regular ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                    <span>{showPassword ? "Hide" : "Show"}</span>
                  </button>
                </div>
                <div className="input-shell">
                  <span className="input-shell__icon" aria-hidden="true"><i className="fa-solid fa-lock"></i></span>
                  <input className="form-input" type={showPassword ? "text" : "password"} id="password" placeholder="Enter password" autoComplete="current-password" required minLength="6" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
                <p className="form-hint">Passwords are case-sensitive.</p>
              </div>

              <div className="auth-form__meta">
                <label className="checkbox">
                  <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                  <span className="checkbox__box" aria-hidden="true"><i className="fa-solid fa-check"></i></span>
                  <span className="checkbox__label">Remember this device</span>
                </label>
              </div>

              <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
                <span className="btn__label">{loading ? "Signing in\u2026" : "Continue to dashboard"}</span>
                <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
              </button>
            </form>

            <div className="demo-accounts">
              <div className="demo-accounts__header">
                <h3 className="demo-accounts__title">Demo accounts</h3>
                <span className="badge badge--neutral">LocalStorage auth</span>
              </div>
              <div className="demo-accounts__grid" role="list">
                {DEMO_ACCOUNTS.map(demo => (
                  <button key={demo.username} type="button" className="demo-account" role="listitem" onClick={() => fillDemo(demo)} aria-label={`Fill ${demo.username} credentials`}>
                    <span className={`demo-account__avatar ${demo.avatarClass}`} aria-hidden="true">{demo.initial}</span>
                    <span className="demo-account__meta">
                      <span className="demo-account__name">{demo.username}</span>
                      <span className="demo-account__role">{demo.role}</span>
                    </span>
                    <span className="demo-account__action" aria-hidden="true"><i className="fa-solid fa-arrow-right"></i></span>
                  </button>
                ))}
              </div>
            </div>

            <footer className="auth-panel__footer">
              <p>
                Session data stays in this browser via LocalStorage.
                <span className="auth-panel__footer-note">No backend required for this prototype.</span>
              </p>
            </footer>
          </div>
        </section>
      </main>

      <footer className="auth-footer">
        <p>&copy; {new Date().getFullYear()} LeadFlow CRM. Production-quality frontend prototype.</p>
      </footer>
    </div>
  );
}
