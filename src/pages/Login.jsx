import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";



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

  if (session) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!username.trim()) { setError("Username is required."); return; }
    if (!password) { setError("Password is required."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }

    setLoading(true);
    try {
      const s = await login(username, password, rememberMe);
      if (!s) {
        setError("Invalid username or password. Try a demo account below.");
        setLoading(false);
        return;
      }
      if (rememberMe) localStorage.setItem("leadflow_remember_user", username.trim());
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Invalid username or password. Try a demo account below.");
      setLoading(false);
    }
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
              <p className="auth-panel__subtitle">Use a demo account below, or enter your credentials.</p>
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
                  Username or Email <span className="form-label__required" aria-hidden="true">*</span>
                </label>
                <div className="input-shell">
                  <span className="input-shell__icon" aria-hidden="true"><i className="fa-regular fa-user"></i></span>
                  <input className="form-input" type="text" id="username" placeholder="Enter username or email" autoComplete="username" required spellCheck="false" value={username} onChange={e => setUsername(e.target.value)} />
                </div>
                <p className="form-hint">Enter your credentials to sign in.</p>
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

            <footer className="auth-panel__footer">
              <p>
                Don&apos;t have an account? <Link to="/signup" style={{ color: "var(--accent)", fontWeight: 600 }}>Create one</Link>
              </p>
            </footer>
          </div>
        </section>
      </main>

      <footer className="auth-footer">
        <p>&copy; {new Date().getFullYear()} LeadFlow CRM. Production-ready with Node.js backend.</p>
      </footer>
    </div>
  );
}
