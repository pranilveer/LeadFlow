import { useState, useEffect, useRef } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import {
  getCurrentUserRecord, updateUserProfile, getLeads, getActivities,
  logActivity, formatDisplayDateTime, escapeHtml, animateCounter
} from "../utils/storage";

export default function Profile() {
  const { session, refreshSession } = useAuth();
  const { showToast } = useToast();
  const [renderKey, setRenderKey] = useState(0);
  const leadCountRef = useRef(null);
  const wonCountRef = useRef(null);

  const user = getCurrentUserRecord(session);
  if (!user) return <Layout activePage="profile"><p>Unable to load profile.</p></Layout>;

  const myLeads = getLeads().filter(l => l.addedBy === user.username);
  const wonCount = myLeads.filter(l => l.leadStatus === "Won").length;

  const [form, setForm] = useState({
    name: user.name || "", email: user.email || "", phone: user.phone || "",
    department: user.department || "", title: user.title || "", bio: user.bio || "",
    newPassword: "", confirmPassword: ""
  });

  useEffect(() => {
    if (leadCountRef.current) animateCounter(leadCountRef.current, myLeads.length);
    if (wonCountRef.current) animateCounter(wonCountRef.current, wonCount);
  }, [renderKey, myLeads.length, wonCount]);

  const activities = getActivities().filter(a => a.user === user.username).slice(0, 15);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.newPassword && form.newPassword !== form.confirmPassword) { showToast("Passwords do not match.", "error"); return; }
    if (form.newPassword && form.newPassword.length < 6) { showToast("Password must be at least 6 characters.", "error"); return; }
    const updates = { name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), department: form.department.trim(), title: form.title.trim(), bio: form.bio.trim() };
    if (form.newPassword) updates.password = form.newPassword;
    updateUserProfile(user.id, updates);
    logActivity("user", "Profile updated.", session.username);
    showToast("Profile saved.", "success");
    refreshSession();
    setForm(f => ({ ...f, newPassword: "", confirmPassword: "" }));
    setRenderKey(k => k + 1);
  };

  return (
    <Layout activePage="profile">
      <div className="page-header">
        <div>
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Manage your account information and view your stats.</p>
        </div>
      </div>

      <div className="profile-layout">
        <aside className="profile-card">
          <div className="profile-card__avatar" style={{ background: user.avatarColor }}>{user.username.charAt(0).toUpperCase()}</div>
          <div className="profile-card__name">{user.name}</div>
          <div className="profile-card__title">{user.title || "\u2014"}</div>
          <span className="badge badge--accent" style={{ marginTop: "0.5rem" }}>{user.role === "admin" ? "Administrator" : "Team Member"}</span>
          <div className="profile-card__stats">
            <div><div className="profile-stat__value" ref={leadCountRef}>0</div><div className="profile-stat__label">My Leads</div></div>
            <div><div className="profile-stat__value" ref={wonCountRef}>0</div><div className="profile-stat__label">Won</div></div>
          </div>
          <p className="form-hint" style={{ marginTop: "1rem", textAlign: "left" }}>Last login: {user.lastLogin ? formatDisplayDateTime(user.lastLogin) : "\u2014"}</p>
        </aside>

        <section className="panel-card">
          <div className="panel-card__header">
            <h2 className="panel-card__title"><i className="fa-solid fa-user-pen"></i> Edit Profile</h2>
          </div>
          <div className="panel-card__body">
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-grid form-grid--2">
                <div className="form-field">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-field">
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="form-field">
                  <label className="form-label">Phone</label>
                  <input className="form-input" type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="form-field">
                  <label className="form-label">Department</label>
                  <input className="form-input" type="text" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} />
                </div>
                <div className="form-field">
                  <label className="form-label">Job Title</label>
                  <input className="form-input" type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="form-field">
                  <label className="form-label">Username</label>
                  <input className="form-input" type="text" value={user.username} readOnly />
                </div>
              </div>
              <div className="form-field">
                <label className="form-label">Bio</label>
                <textarea className="form-textarea" placeholder="Tell us about yourself\u2026" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })}></textarea>
              </div>
              <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "1.25rem 0" }} />
              <h3 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "1rem" }}>Change Password</h3>
              <div className="form-grid form-grid--2">
                <div className="form-field">
                  <label className="form-label">New Password</label>
                  <input className="form-input" type="password" minLength="6" placeholder="Leave blank to keep current" value={form.newPassword} onChange={e => setForm({ ...form, newPassword: e.target.value })} />
                </div>
                <div className="form-field">
                  <label className="form-label">Confirm Password</label>
                  <input className="form-input" type="password" minLength="6" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} />
                </div>
              </div>
              <button type="submit" className="btn btn--primary" style={{ marginTop: "0.5rem" }}><i className="fa-solid fa-check"></i> Save Profile</button>
            </form>
          </div>
        </section>
      </div>

      <section className="panel-card" style={{ marginTop: "1.5rem" }}>
        <div className="panel-card__header">
          <h2 className="panel-card__title"><i className="fa-solid fa-clock-rotate-left"></i> Your Recent Activity</h2>
        </div>
        <div className="panel-card__body">
          <div className="timeline">
            {activities.length === 0 ? (
              <div className="table-empty"><i className="fa-solid fa-clock"></i>No recent activity.</div>
            ) : activities.map(a => (
              <div key={a.id} className="timeline__item">
                <span className="timeline__dot timeline__dot--system"><i className="fa-solid fa-circle"></i></span>
                <div>
                  <div className="timeline__message">{escapeHtml(a.message)}</div>
                  <div className="timeline__meta">{formatDisplayDateTime(a.timestamp)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
