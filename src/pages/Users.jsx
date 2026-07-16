import { useState, useCallback } from "react";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { getUsers, saveUsers, getLeads, logActivity, escapeHtml, uid, isAdmin as checkAdmin } from "../utils/storage";

export default function Users() {
  const { session, isAdmin } = useAuth();
  const { showToast } = useToast();
  const [renderKey, setRenderKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState("");
  const [formData, setFormData] = useState({ username: "", password: "", name: "", email: "", phone: "", role: "user", title: "", department: "", bio: "" });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const refresh = useCallback(() => setRenderKey(k => k + 1), []);

  const getLeadCount = (username) => getLeads().filter(l => l.addedBy === username).length;

  const users = getUsers().filter(u => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return [u.username, u.name, u.email, u.role, u.department].join(" ").toLowerCase().includes(q);
  });

  const openAdd = () => {
    setEditId("");
    setFormData({ username: "", password: "", name: "", email: "", phone: "", role: "user", title: "", department: "", bio: "" });
    setModalOpen(true);
  };

  const openEdit = (u) => {
    setEditId(u.id);
    setFormData({ username: u.username, password: "", name: u.name, email: u.email || "", phone: u.phone || "", role: u.role, title: u.title || "", department: u.department || "", bio: u.bio || "" });
    setModalOpen(true);
  };

  const saveUser = () => {
    if (!formData.username.trim() || !formData.name.trim()) { showToast("Username and full name are required.", "error"); return; }
    if (!editId && (!formData.password || formData.password.length < 6)) { showToast("Password must be at least 6 characters.", "error"); return; }

    const allUsers = getUsers();
    if (!editId && allUsers.some(u => u.username.toLowerCase() === formData.username.toLowerCase())) {
      showToast("Username already exists.", "error");
      return;
    }

    if (editId) {
      const idx = allUsers.findIndex(u => u.id === editId);
      if (idx === -1) return;
      allUsers[idx] = { ...allUsers[idx], ...formData };
      if (formData.password) allUsers[idx].password = formData.password;
      saveUsers(allUsers);
      logActivity("user", `User "${formData.name}" updated.`, session.username);
      showToast("User updated.", "success");
    } else {
      const colors = ["var(--accent)", "var(--green)", "var(--purple)", "var(--amber)", "var(--red)"];
      allUsers.push({ ...formData, id: uid("usr"), password: formData.password, avatarColor: colors[allUsers.length % colors.length], createdAt: new Date().toISOString(), lastLogin: null });
      saveUsers(allUsers);
      logActivity("user", `User "${formData.name}" created.`, session.username);
      showToast("User created.", "success");
    }
    setModalOpen(false);
    refresh();
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const allUsers = getUsers();
    const user = allUsers.find(u => u.id === deleteTarget.id);
    if (!user) return;
    if (user.id === session.userId) { showToast("Cannot delete your own account.", "error"); return; }
    const adminCount = allUsers.filter(u => u.role === "admin").length;
    if (user.role === "admin" && adminCount <= 1) { showToast("Cannot delete the only administrator.", "error"); setDeleteTarget(null); return; }
    saveUsers(allUsers.filter(u => u.id !== deleteTarget.id));
    logActivity("user", `User "${user.name}" deleted.`, session.username);
    showToast("User deleted.", "success");
    setDeleteTarget(null);
    refresh();
  };

  return (
    <Layout activePage="users">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Admin-only access to manage team members.</p>
        </div>
        <div className="page-header__actions">
          <button type="button" className="btn btn--primary btn--sm" onClick={openAdd} disabled={!isAdmin}><i className="fa-solid fa-user-plus"></i> Add User</button>
        </div>
      </div>

      {!isAdmin && (
        <div className="alert alert--error">
          <i className="fa-solid fa-lock"></i>
          <span>You do not have permission to access this page. Administrators only.</span>
        </div>
      )}

      <div className="user-grid">
        {users.map(u => {
          const isSelf = u.id === session.userId;
          return (
            <article key={u.id} className="user-card">
              <div className="user-card__top">
                <span className="user-card__avatar" style={{ background: u.avatarColor }}>{u.username.charAt(0).toUpperCase()}</span>
                <div>
                  <div className="user-card__name">{escapeHtml(u.name)} {u.role === "admin" && <span className="badge badge--accent">Admin</span>}</div>
                  <div className="user-card__title">{escapeHtml(u.title || "\u2014")}</div>
                </div>
              </div>
              <div className="user-card__meta">
                <div><i className="fa-solid fa-at"></i>{escapeHtml(u.username)}</div>
                <div><i className="fa-solid fa-envelope"></i>{escapeHtml(u.email || "\u2014")}</div>
                <div><i className="fa-solid fa-building"></i>{escapeHtml(u.department || "\u2014")}</div>
                <div><i className="fa-solid fa-chart-line"></i>{getLeadCount(u.username)} leads</div>
              </div>
              <div className="category-card__actions">
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => openEdit(u)}><i className="fa-solid fa-pen"></i> Edit</button>
                {!isSelf ? (
                  <button type="button" className="btn btn--ghost btn--sm" style={{ color: "var(--red)" }} onClick={() => setDeleteTarget(u)}><i className="fa-solid fa-trash"></i> Delete</button>
                ) : (
                  <span className="badge badge--neutral">Current user</span>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? "Edit User" : "Add User"}
        footer={<>
          <button type="button" className="btn btn--ghost" onClick={() => setModalOpen(false)}>Cancel</button>
          <button type="button" className="btn btn--primary" onClick={saveUser}><i className="fa-solid fa-check"></i> Save</button>
        </>}>
        <div className="form-grid form-grid--2">
          <div className="form-field">
            <label className="form-label">Username <span className="form-label__required">*</span></label>
            <input className="form-input" type="text" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} readOnly={!!editId} />
          </div>
          <div className="form-field">
            <label className="form-label">Password <span className="form-label__required">*</span></label>
            <input className="form-input" type="password" minLength="6" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
            {editId && <p className="form-hint">Leave blank to keep current password.</p>}
          </div>
          <div className="form-field">
            <label className="form-label">Full Name <span className="form-label__required">*</span></label>
            <input className="form-input" type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div className="form-field">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
          </div>
          <div className="form-field">
            <label className="form-label">Phone</label>
            <input className="form-input" type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
          </div>
          <div className="form-field">
            <label className="form-label">Role</label>
            <select className="form-select" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
              <option value="user">Team Member</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          <div className="form-field">
            <label className="form-label">Job Title</label>
            <input className="form-input" type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
          </div>
          <div className="form-field">
            <label className="form-label">Department</label>
            <input className="form-input" type="text" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} />
          </div>
        </div>
        <div className="form-field">
          <label className="form-label">Bio</label>
          <textarea className="form-textarea" value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })}></textarea>
        </div>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete User" size="sm"
        footer={<>
          <button type="button" className="btn btn--ghost" onClick={() => setDeleteTarget(null)}>Cancel</button>
          <button type="button" className="btn btn--danger" onClick={handleDelete}><i className="fa-solid fa-trash"></i> Delete</button>
        </>}>
        <p>Remove <strong>{deleteTarget?.name}</strong> from the system? Their leads will remain in the database.</p>
      </Modal>
    </Layout>
  );
}
