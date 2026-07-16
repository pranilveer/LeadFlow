import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

export default function Signup() {
  const { session, register: signup } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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
    if (!name.trim()) { setError("Full name is required."); return; }
    if (!password) { setError("Password is required."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }

    setLoading(true);
    try {
      const s = await signup(username.trim(), password, name.trim(), email.trim());
      if (!s) { setError("Registration failed. Please try again."); setLoading(false); return; }
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
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

      <main className="auth-main" style={{ justifyContent: "center" }}>
        <section className="auth-panel-wrap" aria-labelledby="signUpHeading" style={{ maxWidth: 460, width: "100%" }}>
          <div className="glass-card auth-panel">
            <div className="auth-panel__header">
              <h2 id="signUpHeading" className="auth-panel__title">Create your account</h2>
              <p className="auth-panel__subtitle">Join your team and start managing leads.</p>
            </div>

            {error && (
              <div className="alert alert--error" role="alert" aria-live="assertive">
                <i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i>
                <span>{error}</span>
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <div className="form-field">
                <label className="form-label" htmlFor="name">
                  Full Name <span className="form-label__required" aria-hidden="true">*</span>
                </label>
                <div className="input-shell">
                  <span className="input-shell__icon" aria-hidden="true"><i className="fa-solid fa-user"></i></span>
                  <input className="form-input" type="text" id="name" placeholder="John Doe" autoComplete="name" required value={name} onChange={e => setName(e.target.value)} />
                </div>
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="username">
                  Username <span className="form-label__required" aria-hidden="true">*</span>
                </label>
                <div className="input-shell">
                  <span className="input-shell__icon" aria-hidden="true"><i className="fa-regular fa-user"></i></span>
                  <input className="form-input" type="text" id="username" placeholder="Choose a username" autoComplete="username" required spellCheck="false" value={username} onChange={e => setUsername(e.target.value)} />
                </div>
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="email">
                  Email
                </label>
                <div className="input-shell">
                  <span className="input-shell__icon" aria-hidden="true"><i className="fa-solid fa-envelope"></i></span>
                  <input className="form-input" type="email" id="email" placeholder="you@company.com" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
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
                  <input className="form-input" type={showPassword ? "text" : "password"} id="password" placeholder="Min 6 characters" autoComplete="new-password" required minLength="6" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
              </div>

              <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
                <span className="btn__label">{loading ? "Creating account\u2026" : "Create account"}</span>
                <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
              </button>
            </form>

            <footer className="auth-panel__footer">
              <p>
                Already have an account? <Link to="/login" style={{ color: "var(--accent)", fontWeight: 600 }}>Sign in</Link>
              </p>
            </footer>
          </div>
        </section>
      </main>

      <footer className="auth-footer">
        <p>&copy; {new Date().getFullYear()} LeadFlow CRM.</p>
      </footer>
    </div>
  );
}
