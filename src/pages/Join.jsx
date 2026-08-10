import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { getInvite, joinViaInvite } from "../utils/api";

export default function Join() {
  const { code } = useParams();
  const { session } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [orgName, setOrgName] = useState("");
  const [loadingInvite, setLoadingInvite] = useState(true);
  const [inviteError, setInviteError] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (session) {
      navigate("/dashboard", { replace: true });
      return;
    }
    if (!code) { setLoadingInvite(false); return; }
    getInvite(code)
      .then(data => {
        setOrgName(data.organizationName);
        setLoadingInvite(false);
      })
      .catch(err => {
        setInviteError(err.message || "Invalid or expired invite link.");
        setLoadingInvite(false);
      });
  }, [code, session, navigate]);

  if (!code && !loadingInvite) {
    return (
      <div className="auth-body light">
        <div className="auth-atmosphere" aria-hidden="true">
          <div className="auth-atmosphere__orb auth-atmosphere__orb--one"></div>
          <div className="auth-atmosphere__orb auth-atmosphere__orb--two"></div>
          <div className="auth-atmosphere__orb auth-atmosphere__orb--three"></div>
          <div className="auth-atmosphere__grid"></div>
        </div>
        <main className="auth-main" style={{ justifyContent: "center" }}>
          <div className="glass-card auth-panel" style={{ maxWidth: "440px", textAlign: "center" }}>
            <div style={{ padding: "2rem" }}>
              <i className="fa-solid fa-link" style={{ fontSize: "2.5rem", color: "var(--accent)", marginBottom: "1rem" }}></i>
              <h2 style={{ marginBottom: "0.5rem" }}>Enter invite code</h2>
              <p style={{ color: "var(--text-dim)", marginBottom: "1.5rem" }}>Paste the invite link or code you received from your admin.</p>
              <div className="form-field" style={{ textAlign: "left" }}>
                <input className="form-input" type="text" placeholder="Paste invite code here" value={codeInput} onChange={e => setCodeInput(e.target.value)} />
              </div>
              <button type="button" className="btn btn--primary btn--block" disabled={!codeInput.trim()} onClick={() => navigate(`/join/${codeInput.trim()}`)}>
                Continue
              </button>
              <p style={{ marginTop: "1rem" }}><Link to="/login" style={{ color: "var(--accent)" }}>Back to login</Link></p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!username.trim()) { setError("Username is required."); return; }
    if (!password || password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (!name.trim()) { setError("Your name is required."); return; }

    setSubmitting(true);
    try {
      await joinViaInvite(code, username.trim(), password, name.trim(), email.trim());
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Failed to join. Please try again.");
      setSubmitting(false);
    }
  };

  if (loadingInvite) {
    return (
      <div className="auth-body light" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "2rem", color: "var(--accent)" }}></i>
      </div>
    );
  }

  if (inviteError) {
    return (
      <div className="auth-body light">
        <div className="auth-atmosphere" aria-hidden="true">
          <div className="auth-atmosphere__orb auth-atmosphere__orb--one"></div>
          <div className="auth-atmosphere__orb auth-atmosphere__orb--two"></div>
          <div className="auth-atmosphere__orb auth-atmosphere__orb--three"></div>
          <div className="auth-atmosphere__grid"></div>
        </div>
        <main className="auth-main" style={{ justifyContent: "center" }}>
          <div className="glass-card auth-panel" style={{ maxWidth: "440px", textAlign: "center" }}>
            <div style={{ padding: "2rem" }}>
              <i className="fa-solid fa-link-slash" style={{ fontSize: "2.5rem", color: "var(--red)", marginBottom: "1rem" }}></i>
              <h2 style={{ marginBottom: "0.5rem" }}>Invalid invite link</h2>
              <p style={{ color: "var(--text-dim)", marginBottom: "1.5rem" }}>{inviteError}</p>
              <Link to="/login" className="btn btn--primary"><i className="fa-solid fa-arrow-left"></i> Back to login</Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
        <section className="auth-showcase" aria-labelledby="joinHeading">
          <div className="auth-showcase__content">
            <p className="eyebrow">You&apos;ve been invited</p>
            <h1 id="joinHeading" className="auth-showcase__title">
              Join <span style={{ color: "var(--accent)" }}>{orgName}</span>
            </h1>
            <p className="auth-showcase__subtitle">
              Create your account to start collaborating with your team on LeadFlow.
            </p>
            <ul className="auth-feature-list" role="list">
              <li className="auth-feature-list__item">
                <span className="auth-feature-list__icon" aria-hidden="true"><i className="fa-solid fa-building"></i></span>
                <div><strong>Team workspace</strong><span>Work together on leads and categories.</span></div>
              </li>
              <li className="auth-feature-list__item">
                <span className="auth-feature-list__icon" aria-hidden="true"><i className="fa-solid fa-shield-halved"></i></span>
                <div><strong>Secure access</strong><span>Your data is isolated to your organization.</span></div>
              </li>
            </ul>
          </div>
        </section>

        <section className="auth-panel-wrap" aria-labelledby="joinFormHeading">
          <div className="glass-card auth-panel">
            <div className="auth-panel__header">
              <h2 id="joinFormHeading" className="auth-panel__title">Create your account</h2>
              <p className="auth-panel__subtitle">You&apos;ll be added as a team member.</p>
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

              <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
                <span className="btn__label">{submitting ? "Joining…" : "Join organization"}</span>
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
        <p>&copy; {new Date().getFullYear()} LeadFlow CRM. Production-ready with Node.js backend.</p>
      </footer>
    </div>
  );
}
