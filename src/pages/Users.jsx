import { useState, useCallback, useEffect } from "react";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import FilterDropdown from "../components/FilterDropdown";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { getUsers, addUser, updateUser, deleteUser, escapeHtml } from "../utils/api";

export default function Users() {
  const { session, isAdmin } = useAuth();
  const { showToast } = useToast();
  const [renderKey, setRenderKey] = useState(0);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [viewMode, setViewMode] = useState("table"); // "table" | "grid"
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    email: "",
    phone: "",
    role: "user",
    title: "",
    department: "",
    bio: "",
  });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showModalPassword, setShowModalPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(() => setRenderKey(k => k + 1), []);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 768px)");
    const handler = (e) => { if (e.matches) setViewMode("grid"); };
    if (mql.matches) setViewMode("grid");
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    getUsers()
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(err => {
        showToast(err.message, "error");
        setLoading(false);
      });
  }, [renderKey, showToast]);

  const handleRoleChange = async (u, newRole) => {
    if (u.role === newRole) return;
    const userId = u._id || u.id;
    if (userId === session.userId && newRole !== "admin") {
      showToast("Cannot revoke your own administrator privileges.", "error");
      return;
    }
    try {
      await updateUser(userId, { role: newRole });
      showToast(`Updated role for ${u.name} to ${newRole === "admin" ? "Administrator" : "Team Member"}.`, "success");
      refresh();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const filtered = users.filter(u => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return [u.username, u.name, u.email, u.role, u.title, u.department].join(" ").toLowerCase().includes(q);
  });

  const totalUsers = users.length;
  const adminCount = users.filter(u => u.role === "admin").length;
  const memberCount = users.filter(u => u.role === "user").length;
  const totalLeads = users.reduce((acc, u) => acc + (u.leadCount || 0), 0);

  const openAdd = () => {
    setEditId("");
    setShowModalPassword(false);
    setFormData({ username: "", password: "", name: "", email: "", phone: "", role: "user", title: "", department: "", bio: "" });
    setModalOpen(true);
  };

  const openEdit = (u) => {
    setEditId(u._id || u.id);
    setShowModalPassword(false);
    setFormData({
      username: u.username,
      password: "",
      name: u.name,
      email: u.email || "",
      phone: u.phone || "",
      role: u.role,
      title: u.title || "",
      department: u.department || "",
      bio: u.bio || "",
    });
    setModalOpen(true);
  };

  const saveUser = async () => {
    if (!formData.username.trim() || !formData.name.trim()) {
      showToast("Username and full name are required.", "error");
      return;
    }
    if (!editId && (!formData.password || formData.password.length < 6)) {
      showToast("Password must be at least 6 characters.", "error");
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        const updates = { ...formData };
        if (!updates.password) delete updates.password;
        await updateUser(editId, updates);
        showToast("User updated.", "success");
      } else {
        await addUser(formData);
        showToast("User created.", "success");
      }
      setModalOpen(false);
      refresh();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteUser(deleteTarget._id || deleteTarget.id);
      showToast("User deleted.", "success");
      setDeleteTarget(null);
      refresh();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  return (
    <Layout activePage="users">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Admin-only access to manage team members, permissions, and roles.</p>
        </div>
        <div className="page-header__actions">
          <button type="button" className="btn btn--primary btn--sm" onClick={openAdd} disabled={!isAdmin}>
            <i className="fa-solid fa-user-plus"></i> Add User
          </button>
        </div>
      </div>

      {!isAdmin && (
        <div className="alert alert--error" style={{ marginBottom: "1.5rem" }}>
          <i className="fa-solid fa-lock"></i>
          <span>You do not have permission to access this page. Administrators only.</span>
        </div>
      )}

      {/* Stats Overview */}
      <div className="stats-grid" style={{ marginBottom: "1.5rem" }}>
        <article className="stat-card">
          <div className="stat-card__icon stat-card__icon--blue">
            <i className="fa-solid fa-users"></i>
          </div>
          <div className="stat-card__info">
            <div className="stat-card__label">Total Users</div>
            <div className="stat-card__value">{totalUsers}</div>
            <div className="stat-card__meta">Registered accounts</div>
          </div>
        </article>
        <article className="stat-card">
          <div className="stat-card__icon stat-card__icon--purple">
            <i className="fa-solid fa-user-shield"></i>
          </div>
          <div className="stat-card__info">
            <div className="stat-card__label">Administrators</div>
            <div className="stat-card__value">{adminCount}</div>
            <div className="stat-card__meta">Full system access</div>
          </div>
        </article>
        <article className="stat-card">
          <div className="stat-card__icon stat-card__icon--green">
            <i className="fa-solid fa-user-group"></i>
          </div>
          <div className="stat-card__info">
            <div className="stat-card__label">Team Members</div>
            <div className="stat-card__value">{memberCount}</div>
            <div className="stat-card__meta">Standard access</div>
          </div>
        </article>
        <article className="stat-card">
          <div className="stat-card__icon stat-card__icon--amber">
            <i className="fa-solid fa-chart-line"></i>
          </div>
          <div className="stat-card__info">
            <div className="stat-card__label">Leads Assigned</div>
            <div className="stat-card__value">{totalLeads}</div>
            <div className="stat-card__meta">Pipeline leads</div>
          </div>
        </article>
      </div>

      {/* Toolbar: Search, Filters & View Mode Toggle */}
      <div className="table-toolbar" style={{ marginBottom: "1.25rem", display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "0.75rem", flex: 1, minWidth: 0, flexWrap: "wrap" }}>
          <div className="navbar__search" style={{ flex: 1, minWidth: 0 }}>
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
            <input
              type="search"
              placeholder="Search users by name, email, department..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              aria-label="Search users"
            />
          </div>

          <FilterDropdown
            label="All Roles"
            icon="fa-solid fa-shield-halved"
            options={[
              { value: "all", label: `All Roles (${totalUsers})` },
              { value: "admin", label: `Administrators (${adminCount})` },
              { value: "user", label: `Team Members (${memberCount})` },
            ]}
            value={roleFilter}
            onChange={setRoleFilter}
          />
        </div>

        <div className="view-toggle">
          <button
            type="button"
            className={`view-toggle__btn ${viewMode === "table" ? "view-toggle__btn--active" : ""}`}
            onClick={() => setViewMode("table")}
            title="Table View"
          >
            <i className="fa-solid fa-table-list"></i> Table
          </button>
          <button
            type="button"
            className={`view-toggle__btn ${viewMode === "grid" ? "view-toggle__btn--active" : ""}`}
            onClick={() => setViewMode("grid")}
            title="Grid View"
          >
            <i className="fa-solid fa-border-all"></i> Grid
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "2rem", color: "var(--accent)" }}></i>
        </div>
      ) : filtered.length === 0 ? (
        <div className="panel" style={{ padding: "3rem", textAlign: "center", color: "var(--text-dim)" }}>
          <i className="fa-solid fa-user-slash" style={{ fontSize: "2.5rem", marginBottom: "1rem", opacity: 0.5 }}></i>
          <p>No users found matching your criteria.</p>
        </div>
      ) : viewMode === "table" ? (
        /* Data Table View */
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Contact</th>
                <th>Title & Department</th>
                <th>Leads</th>
                <th>Role & Permission</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const uId = u._id || u.id;
                const isSelf = uId === session.userId;
                return (
                  <tr key={uId}>
                    <td>
                      <div className="users-user-cell">
                        <span className="user-avatar" style={{ background: u.avatarColor || "var(--accent)", width: "36px", height: "36px", fontSize: "0.9rem" }}>
                          {u.username.charAt(0).toUpperCase()}
                        </span>
                        <div className="users-user-cell__info">
                          <span className="users-user-cell__name">
                            {escapeHtml(u.name)}{" "}
                            {isSelf && <span className="badge badge--neutral" style={{ fontSize: "0.65rem", padding: "1px 6px" }}>You</span>}
                          </span>
                          <span className="users-user-cell__sub">@{escapeHtml(u.username)}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "2px" }}>
                        <div><i className="fa-solid fa-envelope" style={{ fontSize: "0.75rem", marginRight: "6px", color: "var(--text-faint)" }}></i>{escapeHtml(u.email || "—")}</div>
                        {u.phone && <div><i className="fa-solid fa-phone" style={{ fontSize: "0.75rem", marginRight: "6px", color: "var(--text-faint)" }}></i>{escapeHtml(u.phone)}</div>}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: "0.85rem" }}>
                        <div style={{ fontWeight: 600 }}>{escapeHtml(u.title || "—")}</div>
                        <div style={{ fontSize: "0.78rem", color: "var(--text-faint)" }}>{escapeHtml(u.department || "General")}</div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge--info" style={{ fontWeight: 700 }}>
                        {u.leadCount || 0} leads
                      </span>
                    </td>
                    <td>
                      <FilterDropdown
                        label="Role"
                        icon={u.role === "admin" ? "fa-solid fa-crown" : "fa-solid fa-user"}
                        options={[
                          { value: "user", label: "Team Member" },
                          { value: "admin", label: "Administrator" },
                        ]}
                        value={u.role}
                        onChange={(val) => handleRoleChange(u, val)}
                        disabled={isSelf || !isAdmin}
                      />
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                        <button type="button" className="btn btn--ghost btn--sm" onClick={() => openEdit(u)} title="Edit user details">
                          <i className="fa-solid fa-pen"></i> Edit
                        </button>
                        {!isSelf ? (
                          <button type="button" className="btn btn--ghost btn--sm" style={{ color: "var(--red)" }} onClick={() => setDeleteTarget(u)} title="Delete user">
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Grid View */
        <div className="user-grid">
          {filtered.map(u => {
            const uId = u._id || u.id;
            const isSelf = uId === session.userId;
            return (
              <article key={uId} className="user-card">
                <div className="user-card__top">
                  <span className="user-card__avatar" style={{ background: u.avatarColor || "var(--accent)" }}>
                    {u.username.charAt(0).toUpperCase()}
                  </span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="user-card__name">
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{escapeHtml(u.name)}</span>
                      {isSelf && <span className="badge badge--neutral" style={{ fontSize: "0.65rem", padding: "1px 6px", flexShrink: 0 }}>You</span>}
                    </div>
                    <div className="user-card__title">{escapeHtml(u.title || "Team Member")}</div>
                  </div>
                </div>

                <div className="user-card__meta">
                  <div className="user-card__meta-item">
                    <i className="fa-solid fa-at"></i>
                    <span>{escapeHtml(u.username)}</span>
                  </div>
                  <div className="user-card__meta-item">
                    <i className="fa-solid fa-envelope"></i>
                    <span>{escapeHtml(u.email || "No email added")}</span>
                  </div>
                  <div className="user-card__meta-item">
                    <i className="fa-solid fa-building"></i>
                    <span>{escapeHtml(u.department || "General")}</span>
                  </div>
                  <div className="user-card__meta-item">
                    <i className="fa-solid fa-chart-line"></i>
                    <span className="badge badge--info" style={{ fontWeight: 600, padding: "2px 8px" }}>
                      {u.leadCount || 0} assigned leads
                    </span>
                  </div>

                  <div style={{ marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px dashed var(--border)" }}>
                    <FilterDropdown
                      label="Role"
                      icon={u.role === "admin" ? "fa-solid fa-crown" : "fa-solid fa-user"}
                      options={[
                        { value: "user", label: "Team Member" },
                        { value: "admin", label: "Administrator" },
                      ]}
                      value={u.role}
                      onChange={(val) => handleRoleChange(u, val)}
                      disabled={isSelf || !isAdmin}
                    />
                  </div>
                </div>

                <div className="user-card__actions">
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => openEdit(u)}>
                    <i className="fa-solid fa-pen"></i> Edit User
                  </button>
                  {!isSelf ? (
                    <button type="button" className="btn btn--ghost btn--sm" style={{ color: "var(--red)" }} onClick={() => setDeleteTarget(u)}>
                      <i className="fa-solid fa-trash"></i> Delete
                    </button>
                  ) : (
                    <span className="badge badge--neutral" style={{ fontSize: "0.7rem" }}>Current Account</span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Add / Edit User Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? "Edit User Details" : "Add New User"}
        footer={
          <>
            <button type="button" className="btn btn--ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="button" className="btn btn--primary" onClick={saveUser} disabled={saving}>
              {saving
                ? <><i className="fa-solid fa-spinner fa-spin"></i> Saving…</>
                : <><i className="fa-solid fa-check"></i> Save User</>
              }
            </button>
          </>
        }
      >
        <div className="form-grid form-grid--2">
          <div className="form-field">
            <label className="form-label">Username <span className="form-label__required">*</span></label>
            <input
              className="form-input"
              type="text"
              value={formData.username}
              onChange={e => setFormData({ ...formData, username: e.target.value })}
              readOnly={!!editId}
            />
          </div>
          <div className="form-field">
            <label className="form-label">Password {!editId && <span className="form-label__required">*</span>}</label>
            <div style={{ position: "relative" }}>
              <input
                className="form-input"
                type={showModalPassword ? "text" : "password"}
                minLength="6"
                placeholder={editId ? "Leave empty to retain current" : "Minimum 6 characters"}
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                style={{ paddingRight: "2.5rem" }}
              />
              <button type="button" onClick={() => setShowModalPassword(v => !v)} style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)", fontSize: "0.85rem", padding: "0.2rem" }}>
                <i className={`fa-regular ${showModalPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
              </button>
            </div>
            {editId && <p className="form-hint">Leave blank to keep current password.</p>}
          </div>
          <div className="form-field">
            <label className="form-label">Full Name <span className="form-label__required">*</span></label>
            <input
              className="form-input"
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="form-field">
            <label className="form-label">Role & Permission</label>
            <FilterDropdown
              label="Select Role"
              icon="fa-solid fa-shield-halved"
              options={[
                { value: "user", label: "Team Member" },
                { value: "admin", label: "Administrator" },
              ]}
              value={formData.role}
              onChange={(val) => setFormData({ ...formData, role: val })}
              disabled={editId && editId === session.userId}
            />
          </div>
          <div className="form-field">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="form-field">
            <label className="form-label">Phone</label>
            <input
              className="form-input"
              type="tel"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div className="form-field">
            <label className="form-label">Job Title</label>
            <input
              className="form-input"
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div className="form-field">
            <label className="form-label">Department</label>
            <input
              className="form-input"
              type="text"
              value={formData.department}
              onChange={e => setFormData({ ...formData, department: e.target.value })}
            />
          </div>
        </div>
        <div className="form-field">
          <label className="form-label">Bio / Notes</label>
          <textarea
            className="form-textarea"
            rows="3"
            value={formData.bio}
            onChange={e => setFormData({ ...formData, bio: e.target.value })}
          ></textarea>
        </div>
      </Modal>

      {/* Delete User Modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete User"
        size="sm"
        footer={
          <>
            <button type="button" className="btn btn--ghost" onClick={() => setDeleteTarget(null)}>Cancel</button>
            <button type="button" className="btn btn--danger" onClick={handleDelete}>
              <i className="fa-solid fa-trash"></i> Delete User
            </button>
          </>
        }
      >
        <p>
          Are you sure you want to remove <strong>{deleteTarget?.name}</strong> (@{deleteTarget?.username}) from the system?
        </p>
        <p style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "var(--text-faint)" }}>
          Their assigned leads will remain safely saved in the database.
        </p>
      </Modal>
    </Layout>
  );
}
