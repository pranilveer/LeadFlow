import { useState } from "react";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import {
  getSettings, saveSettings, getActivities, exportAllData, importAllData,
  resetAllData, downloadFile, formatISODate, formatDisplayDateTime,
  escapeHtml, LEAD_STATUSES, LEAD_SOURCES, logActivity
} from "../utils/storage";

const ACTIVITY_ICONS = {
  lead: { icon: "fa-user-plus", cls: "timeline__dot--lead" },
  auth: { icon: "fa-right-to-bracket", cls: "timeline__dot--auth" },
  category: { icon: "fa-tags", cls: "timeline__dot--category" },
  user: { icon: "fa-users", cls: "timeline__dot--user" },
  system: { icon: "fa-gear", cls: "timeline__dot--system" },
};

export default function Settings() {
  const { session } = useAuth();
  const { showToast } = useToast();
  const [activeSection, setActiveSection] = useState("general");
  const [activityFilter, setActivityFilter] = useState("");
  const [activitySearch, setActivitySearch] = useState("");
  const [resetOpen, setResetOpen] = useState(false);

  const [generalForm, setGeneralForm] = useState(() => {
    const s = getSettings();
    return { companyName: s.companyName || "", timezone: s.timezone || "America/New_York", leadsPerPage: s.leadsPerPage || 10, defaultLeadStatus: s.defaultLeadStatus || "New", defaultLeadSource: s.defaultLeadSource || "Website" };
  });

  const [notifForm, setNotifForm] = useState(() => {
    const s = getSettings();
    return { emailNotifications: !!s.emailNotifications, desktopNotifications: !!s.desktopNotifications, autoBackup: !!s.autoBackup };
  });

  const saveGeneral = (e) => {
    e.preventDefault();
    const settings = getSettings();
    Object.assign(settings, generalForm, { leadsPerPage: Number(generalForm.leadsPerPage) });
    saveSettings(settings);
    logActivity("system", "General settings updated.", session.username);
    showToast("Settings saved.", "success");
  };

  const saveNotif = (e) => {
    e.preventDefault();
    const settings = getSettings();
    Object.assign(settings, notifForm);
    saveSettings(settings);
    logActivity("system", "Notification preferences updated.", session.username);
    showToast("Preferences saved.", "success");
  };

  const downloadBackup = () => {
    downloadFile(JSON.stringify(exportAllData(), null, 2), `leadflow-backup-${formatISODate(new Date())}.json`, "application/json");
    logActivity("system", "Full backup downloaded.", session.username);
    showToast("Backup downloaded.", "success");
  };

  const restoreBackup = (file) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const payload = JSON.parse(ev.target.result);
        const result = importAllData(payload, session);
        if (result.error) { showToast(result.error, "error"); return; }
        showToast("Backup restored successfully.", "success");
        const s = getSettings();
        setGeneralForm({ companyName: s.companyName || "", timezone: s.timezone || "America/New_York", leadsPerPage: s.leadsPerPage || 10, defaultLeadStatus: s.defaultLeadStatus || "New", defaultLeadSource: s.defaultLeadSource || "Website" });
        setNotifForm({ emailNotifications: !!s.emailNotifications, desktopNotifications: !!s.desktopNotifications, autoBackup: !!s.autoBackup });
      } catch { showToast("Invalid backup file.", "error"); }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    resetAllData(session);
    setResetOpen(false);
    const s = getSettings();
    setGeneralForm({ companyName: s.companyName || "", timezone: s.timezone || "America/New_York", leadsPerPage: s.leadsPerPage || 10, defaultLeadStatus: s.defaultLeadStatus || "New", defaultLeadSource: s.defaultLeadSource || "Website" });
    setNotifForm({ emailNotifications: !!s.emailNotifications, desktopNotifications: !!s.desktopNotifications, autoBackup: !!s.autoBackup });
    showToast("Data reset to defaults.", "success");
  };

  const activities = getActivities().filter(a => {
    if (activityFilter && a.type !== activityFilter) return false;
    if (activitySearch) {
      const q = activitySearch.toLowerCase();
      return (a.message + " " + a.user).toLowerCase().includes(q);
    }
    return true;
  }).slice(0, 100);

  const navItems = [
    { key: "general", icon: "fa-sliders", label: "General" },
    { key: "notifications", icon: "fa-bell", label: "Notifications" },
    { key: "backup", icon: "fa-database", label: "Backup & Restore" },
    { key: "activity", icon: "fa-clock-rotate-left", label: "Activity" },
  ];

  const activityFilters = [
    { filter: "", label: "All" },
    { filter: "lead", label: "Leads" },
    { filter: "auth", label: "Auth" },
    { filter: "category", label: "Categories" },
    { filter: "user", label: "Users" },
    { filter: "system", label: "System" },
  ];

  return (
    <Layout activePage="settings">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Configure your workspace, backup data, and review activity.</p>
        </div>
      </div>

      <div className="settings-grid">
        <nav className="settings-nav" aria-label="Settings sections">
          {navItems.map(item => (
            <button key={item.key} type="button" className={`settings-nav__btn ${activeSection === item.key ? "settings-nav__btn--active" : ""}`} onClick={() => setActiveSection(item.key)}>
              <i className={`fa-solid ${item.icon}`}></i> {item.label}
            </button>
          ))}
        </nav>

        <div className="settings-panels">
          {activeSection === "general" && (
            <section className="settings-section settings-section--active panel-card">
              <div className="panel-card__header"><h2 className="panel-card__title"><i className="fa-solid fa-sliders"></i> General Settings</h2></div>
              <div className="panel-card__body">
                <form onSubmit={saveGeneral}>
                  <div className="form-grid form-grid--2">
                    <div className="form-field">
                      <label className="form-label">Company Name</label>
                      <input className="form-input" type="text" value={generalForm.companyName} onChange={e => setGeneralForm({ ...generalForm, companyName: e.target.value })} />
                    </div>
                    <div className="form-field">
                      <label className="form-label">Timezone</label>
                      <select className="form-select" value={generalForm.timezone} onChange={e => setGeneralForm({ ...generalForm, timezone: e.target.value })}>
                        <option value="America/New_York">Eastern (US)</option>
                        <option value="America/Chicago">Central (US)</option>
                        <option value="America/Denver">Mountain (US)</option>
                        <option value="America/Los_Angeles">Pacific (US)</option>
                        <option value="Europe/London">London</option>
                        <option value="Asia/Kolkata">India (IST)</option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>
                    <div className="form-field">
                      <label className="form-label">Leads Per Page</label>
                      <select className="form-select" value={generalForm.leadsPerPage} onChange={e => setGeneralForm({ ...generalForm, leadsPerPage: e.target.value })}>
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                      </select>
                    </div>
                    <div className="form-field">
                      <label className="form-label">Default Lead Status</label>
                      <select className="form-select" value={generalForm.defaultLeadStatus} onChange={e => setGeneralForm({ ...generalForm, defaultLeadStatus: e.target.value })}>
                        {LEAD_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="form-field">
                      <label className="form-label">Default Lead Source</label>
                      <select className="form-select" value={generalForm.defaultLeadSource} onChange={e => setGeneralForm({ ...generalForm, defaultLeadSource: e.target.value })}>
                        {LEAD_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="btn btn--primary" style={{ marginTop: "0.5rem" }}><i className="fa-solid fa-check"></i> Save Settings</button>
                </form>
              </div>
            </section>
          )}

          {activeSection === "notifications" && (
            <section className="settings-section settings-section--active panel-card">
              <div className="panel-card__header"><h2 className="panel-card__title"><i className="fa-solid fa-bell"></i> Notifications</h2></div>
              <div className="panel-card__body">
                <form onSubmit={saveNotif}>
                  <label className="checkbox" style={{ marginBottom: "1rem" }}>
                    <input type="checkbox" checked={notifForm.emailNotifications} onChange={e => setNotifForm({ ...notifForm, emailNotifications: e.target.checked })} />
                    <span className="checkbox__box"><i className="fa-solid fa-check"></i></span>
                    <span className="checkbox__label">Email notifications for new leads</span>
                  </label>
                  <label className="checkbox" style={{ marginBottom: "1rem" }}>
                    <input type="checkbox" checked={notifForm.desktopNotifications} onChange={e => setNotifForm({ ...notifForm, desktopNotifications: e.target.checked })} />
                    <span className="checkbox__box"><i className="fa-solid fa-check"></i></span>
                    <span className="checkbox__label">Desktop notifications</span>
                  </label>
                  <label className="checkbox">
                    <input type="checkbox" checked={notifForm.autoBackup} onChange={e => setNotifForm({ ...notifForm, autoBackup: e.target.checked })} />
                    <span className="checkbox__box"><i className="fa-solid fa-check"></i></span>
                    <span className="checkbox__label">Prompt for backup on logout</span>
                  </label>
                  <button type="submit" className="btn btn--primary" style={{ marginTop: "1.25rem" }}><i className="fa-solid fa-check"></i> Save Preferences</button>
                </form>
              </div>
            </section>
          )}

          {activeSection === "backup" && (
            <section className="settings-section settings-section--active panel-card">
              <div className="panel-card__header"><h2 className="panel-card__title"><i className="fa-solid fa-database"></i> Backup &amp; Restore</h2></div>
              <div className="panel-card__body">
                <p className="form-hint" style={{ marginBottom: "1rem" }}>Export all CRM data as JSON, or restore from a previous backup file.</p>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
                  <button type="button" className="btn btn--primary" onClick={downloadBackup}><i className="fa-solid fa-download"></i> Download Backup</button>
                  <button type="button" className="btn btn--danger" onClick={() => setResetOpen(true)}><i className="fa-solid fa-rotate-left"></i> Reset to Defaults</button>
                </div>
                <div className="backup-zone" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (e.dataTransfer.files[0]) restoreBackup(e.dataTransfer.files[0]); }}>
                  <i className="fa-solid fa-cloud-arrow-up"></i>
                  <p>Drag &amp; drop a backup JSON file, or <label style={{ color: "var(--accent)", cursor: "pointer", fontWeight: 600 }}>browse<input type="file" accept=".json" hidden onChange={e => { if (e.target.files[0]) restoreBackup(e.target.files[0]); }} /></label></p>
                </div>
              </div>
            </section>
          )}

          {activeSection === "activity" && (
            <section className="settings-section settings-section--active panel-card">
              <div className="panel-card__header">
                <h2 className="panel-card__title"><i className="fa-solid fa-clock-rotate-left"></i> Activity Timeline</h2>
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => { setActivityFilter(""); setActivitySearch(""); }}><i className="fa-solid fa-xmark"></i> Clear filter</button>
              </div>
              <div className="panel-card__body">
                <div className="filter-chips" style={{ marginBottom: "1rem" }}>
                  {activityFilters.map(f => (
                    <button key={f.filter} type="button" className={`filter-chip ${activityFilter === f.filter ? "filter-chip--active" : ""}`} onClick={() => setActivityFilter(f.filter)}>{f.label}</button>
                  ))}
                </div>
                <div className="timeline">
                  {activities.length === 0 ? (
                    <div className="table-empty"><i className="fa-solid fa-clock-rotate-left"></i>No activity recorded yet.</div>
                  ) : activities.map(a => {
                    const meta = ACTIVITY_ICONS[a.type] || ACTIVITY_ICONS.system;
                    return (
                      <div key={a.id} className="timeline__item">
                        <span className={`timeline__dot ${meta.cls}`}><i className={`fa-solid ${meta.icon}`}></i></span>
                        <div>
                          <div className="timeline__message">{escapeHtml(a.message)}</div>
                          <div className="timeline__meta">{escapeHtml(a.user)} &middot; {formatDisplayDateTime(a.timestamp)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      <Modal open={resetOpen} onClose={() => setResetOpen(false)} title="Reset All Data" size="sm"
        footer={<>
          <button type="button" className="btn btn--ghost" onClick={() => setResetOpen(false)}>Cancel</button>
          <button type="button" className="btn btn--danger" onClick={handleReset}><i className="fa-solid fa-rotate-left"></i> Reset</button>
        </>}>
        <p>This will erase all leads, categories, activities, and settings &mdash; restoring factory defaults. Users and your session will be preserved. This cannot be undone.</p>
      </Modal>
    </Layout>
  );
}
