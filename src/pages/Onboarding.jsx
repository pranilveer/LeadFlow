import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

export default function Onboarding() {
  const { session, onboard } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [orgName, setOrgName] = useState("");
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
    if (!orgName.trim()) { setError("Organization name is required."); return; }
    if (!username.trim()) { setError("Username is required."); return; }
    if (!password || password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (!name.trim()) { setError("Your name is required."); return; }

    setLoading(true);
    try {
      await onboard(orgName.trim(), username.trim(), password, name.trim(), email.trim());
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Failed to create organization. Please try again.");
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
          <span className="brand__mark" aria-hidden="true"><i className="fa-solid fa-arrow-trend-up"></i></span>
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
        <section className="auth-showcase" aria-labelledby="onboardingHeading">
          <div className="auth-showcase__content">
            <p className="eyebrow">Get started in seconds</p>
            <h1 id="onboardingHeading" className="auth-showcase__title">
              Create your organization
            </h1>
            <p className="auth-showcase__subtitle">
              Set up your company workspace. You&apos;ll be the first administrator
              and can invite team members from the dashboard.
            </p>
            <ul className="auth-feature-list" role="list">
              <li className="auth-feature-list__item">
                <span className="auth-feature-list__icon" aria-hidden="true"><i className="fa-solid fa-building"></i></span>
                <div><strong>Your own workspace</strong><span>Isolated data for your company only.</span></div>
              </li>
              <li className="auth-feature-list__item">
                <span className="auth-feature-list__icon" aria-hidden="true"><i className="fa-solid fa-user-shield"></i></span>
                <div><strong>Admin by default</strong><span>Full control over users and settings.</span></div>
              </li>
              <li className="auth-feature-list__item">
                <span className="auth-feature-list__icon" aria-hidden="true"><i className="fa-solid fa-users"></i></span>
                <div><strong>Invite your team</strong><span>Add members from User Management later.</span></div>
              </li>
            </ul>
          </div>
        </section>

        <section className="auth-panel-wrap" aria-labelledby="onboardingFormHeading">
          <div className="glass-card auth-panel">
            <div className="auth-panel__header">
              <h2 id="onboardingFormHeading" className="auth-panel__title">Create company</h2>
              <p className="auth-panel__subtitle">Set up your organization and admin account.</p>
            </div>

            {error && (
              <div className="alert alert--error" role="alert" aria-live="assertive">
                <i className="fa-solid fa-circle-exclamation" aria-hidden="true"></i>
                <span>{error}</span>
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <div className="form-field">
                <label className="form-label" htmlFor="orgName">
                  Organization Name <span className="form-label__required" aria-hidden="true">*</span>
                </label>
                <div className="input-shell">
                  <span className="input-shell__icon" aria-hidden="true"><i className="fa-solid fa-building"></i></span>
                  <input className="form-input" type="text" id="orgName" placeholder="e.g. Acme Corp" autoComplete="organization" required value={orgName} onChange={e => setOrgName(e.target.value)} />
                </div>
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="name">
                  Your Name <span className="form-label__required" aria-hidden="true">*</span>
                </label>
                <div className="input-shell">
                  <span className="input-shell__icon" aria-hidden="true"><i className="fa-regular fa-user"></i></span>
                  <input className="form-input" type="text" id="name" placeholder="Full name" autoComplete="name" required value={name} onChange={e => setName(e.target.value)} />
                </div>
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="username">
                  Username <span className="form-label__required" aria-hidden="true">*</span>
                </label>
                <div className="input-shell">
                  <span className="input-shell__icon" aria-hidden="true"><i className="fa-regular fa-at"></i></span>
                  <input className="form-input" type="text" id="username" placeholder="Choose a username" autoComplete="username" required spellCheck="false" value={username} onChange={e => setUsername(e.target.value)} />
                </div>
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="email">Email</label>
                <div className="input-shell">
                  <span className="input-shell__icon" aria-hidden="true"><i className="fa-regular fa-envelope"></i></span>
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
                  <input className="form-input" type={showPassword ? "text" : "password"} id="password" placeholder="Minimum 6 characters" autoComplete="new-password" required minLength="6" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
              </div>

              <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
                <span className="btn__label">{loading ? "Creating…" : "Create organization"}</span>
                <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
              </button>
            </form>

            <footer className="auth-panel__footer" style={{ textAlign: "center" }}>
              <p>
                Already have an account? <Link to="/login" style={{ color: "var(--accent)", fontWeight: 600 }}>Sign in</Link>
              </p>
            </footer>
          </div>
        </section>
      </main>

      <footer className="auth-footer">
        <div className="auth-social">
          <a href="https://github.com/pranilveer" aria-label="GitHub"><i className="fa-brands fa-github" aria-hidden="true"></i></a>
          <a href="https://x.com/pranilveer" aria-label="X (Twitter)"><i className="fa-brands fa-x-twitter" aria-hidden="true"></i></a>
          <a href="https://linkedin.com/in/pranilveer" aria-label="LinkedIn"><i className="fa-brands fa-linkedin-in" aria-hidden="true"></i></a>
          <a href="https://instagram.com/veerpranil" aria-label="Instagram"><i className="fa-brands fa-instagram" aria-hidden="true"></i></a>
          <a href="https://youtube.com/@veerpranil" aria-label="YouTube"><i className="fa-brands fa-youtube" aria-hidden="true"></i></a>
        </div>
        <p>&copy; {new Date().getFullYear()} LeadFlow CRM. Production-ready with Node.js backend.</p>
      </footer>
    </div>
  );
}
