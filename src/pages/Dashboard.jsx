import { useState, useEffect, useCallback, useRef } from "react";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import {
  getLeads, getLeadStats, addLead, updateLead, deleteLead,
  getCategories, importLeads, categoryColor, statusBadgeClass, escapeHtml,
  LEAD_STATUSES, LEAD_SOURCES, animateCounter, copyToClipboard,
  leadsToCSV, parseCSV, downloadFile, formatISODate,
  getSettings, formatDisplayDateTime
} from "../utils/api";

export default function Dashboard() {
  const { session } = useAuth();
  const { showToast } = useToast();
  const [renderKey, setRenderKey] = useState(0);

  const [leads, setLeads] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({ total: 0, today: 0, categories: 0, myLeads: 0 });
  const [settings, setSettingsState] = useState({});
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterOwner, setFilterOwner] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState("addedDate");
  const [sortDir, setSortDir] = useState("desc");

  const [formOpen, setFormOpen] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [form, setForm] = useState({ leadName: "", businessName: "", email: "", phone: "", website: "", category: "Technology", customCategory: "", city: "", state: "", country: "", address: "", description: "", leadSource: "Website", leadStatus: "New" });

  const [viewLead, setViewLead] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importRows, setImportRows] = useState([]);
  const totalStatRef = useRef(null);
  const todayStatRef = useRef(null);
  const catStatRef = useRef(null);
  const myStatRef = useRef(null);

  const refresh = useCallback(() => setRenderKey(k => k + 1), []);

  const loadData = useCallback(async () => {
    try {
      const [leadsData, catsData, statsData, settingsData] = await Promise.all([
        getLeads(), getCategories(), getLeadStats(), getSettings()
      ]);
      setLeads(leadsData);
      setCategories(catsData);
      setStats(statsData);
      setSettingsState(settingsData);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { loadData(); }, [loadData, renderKey]);

  const today = formatISODate(new Date());

  const filteredLeads = leads.filter(l => {
    if (filterStatus && l.leadStatus !== filterStatus) return false;
    if (filterCategory && l.category !== filterCategory) return false;
    if (filterOwner && l.addedBy !== filterOwner) return false;
    if (!searchQuery) return true;
    const hay = [l.id, l.leadName, l.businessName, l.email, l.phone, l.category, l.customCategory, l.city, l.leadStatus, l.leadSource, l.addedBy].join(" ").toLowerCase();
    return hay.includes(searchQuery.toLowerCase());
  }).sort((a, b) => {
    const av = a[sortKey] || "";
    const bv = b[sortKey] || "";
    if (av < bv) return sortDir === "asc" ? -1 : 1;
    if (av > bv) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / pageSize));
  const effectivePage = Math.min(page, totalPages);
  const pagedLeads = filteredLeads.slice((effectivePage - 1) * pageSize, effectivePage * pageSize);

  const uniqueOwners = [...new Set(leads.map(l => l.addedBy))].sort();

  useEffect(() => {
    if (totalStatRef.current) animateCounter(totalStatRef.current, stats.total);
    if (todayStatRef.current) animateCounter(todayStatRef.current, stats.today);
    if (catStatRef.current) animateCounter(catStatRef.current, stats.categories);
    if (myStatRef.current) animateCounter(myStatRef.current, stats.myLeads);
  }, [renderKey, stats]);

  useEffect(() => { setPage(1); }, [searchQuery, filterStatus, filterCategory, filterOwner, pageSize]);

  const openAddForm = () => {
    setEditLead(null);
    setForm({ leadName: "", businessName: "", email: "", phone: "", website: "", category: categories[0]?.name || "Technology", customCategory: "", city: "", state: "", country: "", address: "", description: "", leadSource: settings.defaultLeadSource || "Website", leadStatus: settings.defaultLeadStatus || "New" });
    setFormOpen(true);
  };

  const openEditForm = (lead) => {
    setEditLead(lead);
    setForm({ leadName: lead.leadName, businessName: lead.businessName, email: lead.email, phone: lead.phone || "", website: lead.website || "", category: lead.category, customCategory: lead.customCategory || "", city: lead.city || "", state: lead.state || "", country: lead.country || "", address: lead.address || "", description: lead.description || "", leadSource: lead.leadSource, leadStatus: lead.leadStatus });
    setFormOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.leadName) { showToast("Lead name is required.", "error"); return; }
    if (!form.businessName) { showToast("Business name is required.", "error"); return; }
    if (!form.email) { showToast("Email is required.", "error"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { showToast("Enter a valid email address.", "error"); return; }
    if (!form.category) { showToast("Category is required.", "error"); return; }

    try {
      if (editLead) {
        await updateLead(editLead.id, form);
        showToast("Lead updated successfully.", "success");
      } else {
        await addLead(form);
        showToast("Lead created successfully.", "success");
      }
      setFormOpen(false);
      refresh();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteLead(deleteTarget.id);
      showToast("Lead deleted.", "success");
      refresh();
    } catch (err) {
      showToast(err.message, "error");
    }
    setDeleteTarget(null);
  };

  const handleImport = async () => {
    try {
      const valid = importRows.filter(row => row.leadName && row.email);
      await importLeads(valid);
      showToast(`${valid.length} lead(s) imported.`, "success");
      setImportRows([]);
      setImportOpen(false);
      refresh();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleImportFile = (file) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const rows = parseCSV(ev.target.result).filter(r => r.leadName);
      setImportRows(rows);
    };
    reader.readAsText(file);
  };

  const handleCopy = (text) => {
    copyToClipboard(text).then(() => showToast("Copied to clipboard.", "success"));
  };

  const exportCSV = () => {
    downloadFile(leadsToCSV(filteredLeads), `leadflow-leads-${formatISODate(new Date())}.csv`, "text/csv");
    showToast(`CSV exported (${filteredLeads.length} leads).`, "success");
  };

  const exportJSON = () => {
    downloadFile(JSON.stringify(filteredLeads, null, 2), `leadflow-leads-${formatISODate(new Date())}.json`, "application/json");
    showToast(`JSON exported (${filteredLeads.length} leads).`, "success");
  };

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const sortIcon = (key) => {
    if (sortKey !== key) return "fa-sort";
    return sortDir === "asc" ? "fa-sort-up" : "fa-sort-down";
  };

  if (loading) {
    return (
      <Layout activePage="dashboard">
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "2rem", color: "var(--accent)" }}></i>
        </div>
      </Layout>
    );
  }

  return (
    <Layout activePage="dashboard">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of your lead pipeline and activity.</p>
        </div>
        <div className="page-header__actions">
          <button type="button" className="btn btn--secondary btn--sm" onClick={() => setImportOpen(true)}><i className="fa-solid fa-file-import"></i> Import CSV</button>
          <button type="button" className="btn btn--secondary btn--sm" onClick={exportCSV}><i className="fa-solid fa-file-csv"></i> Export CSV</button>
          <button type="button" className="btn btn--secondary btn--sm" onClick={exportJSON}><i className="fa-solid fa-file-code"></i> Export JSON</button>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => window.print()}><i className="fa-solid fa-print"></i> Print</button>
          <button type="button" className="btn btn--primary btn--sm" onClick={openAddForm}><i className="fa-solid fa-plus"></i> Add Lead</button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--blue"><i className="fa-solid fa-users"></i></div>
          <div>
            <div className="stat-card__label">Total Leads</div>
            <div className="stat-card__value" ref={totalStatRef}>0</div>
            <div className="stat-card__meta">All pipeline records</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--green"><i className="fa-solid fa-calendar-day"></i></div>
          <div>
            <div className="stat-card__label">Today&apos;s Leads</div>
            <div className="stat-card__value" ref={todayStatRef}>0</div>
            <div className="stat-card__meta">Added today</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--purple"><i className="fa-solid fa-tags"></i></div>
          <div>
            <div className="stat-card__label">Categories</div>
            <div className="stat-card__value" ref={catStatRef}>0</div>
            <div className="stat-card__meta">Active categories</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--amber"><i className="fa-solid fa-user-check"></i></div>
          <div>
            <div className="stat-card__label">My Leads</div>
            <div className="stat-card__value" ref={myStatRef}>0</div>
            <div className="stat-card__meta">Assigned to you</div>
          </div>
        </div>
      </div>

      <section className={`panel-card collapsible ${formOpen ? "collapsible--open" : ""}`} style={{ marginBottom: "1.5rem" }}>
        <div className="panel-card__header collapsible__header" onClick={() => setFormOpen(!formOpen)} tabIndex={0} role="button" aria-expanded={formOpen}>
          <h2 className="panel-card__title"><i className="fa-solid fa-pen-to-square"></i> <span>{editLead ? "Edit Lead" : "Add New Lead"}</span></h2>
          <i className="fa-solid fa-chevron-down collapsible__icon"></i>
        </div>
        <div className="panel-card__body collapsible__body">
          <form onSubmit={handleFormSubmit} noValidate>
            <div className="form-grid form-grid--3">
              <div className="form-field">
                <label className="form-label" htmlFor="leadName">Lead Name <span className="form-label__required">*</span></label>
                <input className="form-input" type="text" id="leadName" required placeholder="Full name" value={form.leadName} onChange={e => setForm({ ...form, leadName: e.target.value })} />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="businessName">Business Name <span className="form-label__required">*</span></label>
                <input className="form-input" type="text" id="businessName" required placeholder="Company name" value={form.businessName} onChange={e => setForm({ ...form, businessName: e.target.value })} />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="email">Email <span className="form-label__required">*</span></label>
                <input className="form-input" type="email" id="email" required placeholder="email@company.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="phone">Phone</label>
                <input className="form-input" type="tel" id="phone" placeholder="+1 (555) 000-0000" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="website">Website</label>
                <input className="form-input" type="url" id="website" placeholder="https://example.com" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="category">Category <span className="form-label__required">*</span></label>
                <select className="form-select" id="category" required value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {categories.map(c => <option key={c._id || c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              {form.category === "Other" && (
                <div className="form-field">
                  <label className="form-label" htmlFor="customCategory">Custom Category</label>
                  <input className="form-input" type="text" id="customCategory" placeholder="Enter custom category" value={form.customCategory} onChange={e => setForm({ ...form, customCategory: e.target.value })} />
                </div>
              )}
              <div className="form-field">
                <label className="form-label" htmlFor="city">City</label>
                <input className="form-input" type="text" id="city" placeholder="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="state">State</label>
                <input className="form-input" type="text" id="state" placeholder="State / Province" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="country">Country</label>
                <input className="form-input" type="text" id="country" placeholder="Country" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="leadSource">Lead Source</label>
                <select className="form-select" id="leadSource" value={form.leadSource} onChange={e => setForm({ ...form, leadSource: e.target.value })}>
                  {LEAD_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="leadStatus">Lead Status</label>
                <select className="form-select" id="leadStatus" value={form.leadStatus} onChange={e => setForm({ ...form, leadStatus: e.target.value })}>
                  {LEAD_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="address">Address</label>
              <input className="form-input" type="text" id="address" placeholder="Street address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="description">Description</label>
              <textarea className="form-textarea" id="description" placeholder="Notes about this lead\u2026" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}></textarea>
            </div>
            {editLead && (
              <div className="form-grid form-grid--2">
                <div className="form-field"><label className="form-label">Lead ID</label><input className="form-input" type="text" value={editLead.id} readOnly /></div>
                <div className="form-field"><label className="form-label">Added By</label><input className="form-input" type="text" value={editLead.addedBy} readOnly /></div>
                <div className="form-field"><label className="form-label">Added Date</label><input className="form-input" type="text" value={editLead.addedDate} readOnly /></div>
                <div className="form-field"><label className="form-label">Added Time</label><input className="form-input" type="text" value={editLead.addedTime} readOnly /></div>
              </div>
            )}
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
              <button type="submit" className="btn btn--primary"><i className="fa-solid fa-check"></i> <span>{editLead ? "Update Lead" : "Save Lead"}</span></button>
              {editLead && <button type="button" className="btn btn--ghost" onClick={() => { setFormOpen(false); setEditLead(null); }}>Cancel</button>}
            </div>
          </form>
        </div>
      </section>

      <section className="panel-card">
        <div className="panel-card__header">
          <h2 className="panel-card__title"><i className="fa-solid fa-table"></i> Leads</h2>
        </div>
        <div className="panel-card__body" style={{ padding: 0 }}>
          <div className="table-toolbar" style={{ padding: "1rem 1.35rem 0" }}>
            <div className="table-toolbar__search">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input type="search" placeholder="Search leads\u2026" aria-label="Search leads table" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <select className="form-select" style={{ width: "auto", minWidth: 140 }} aria-label="Filter by status" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">All Statuses</option>
              {LEAD_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select className="form-select" style={{ width: "auto", minWidth: 140 }} aria-label="Filter by category" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c._id || c.id} value={c.name}>{c.name}</option>)}
            </select>
            <select className="form-select" style={{ width: "auto", minWidth: 140 }} aria-label="Filter by owner" value={filterOwner} onChange={e => setFilterOwner(e.target.value)}>
              <option value="">All Owners</option>
              {uniqueOwners.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <select className="form-select" style={{ width: "auto", minWidth: 100 }} aria-label="Rows per page" value={pageSize} onChange={e => setPageSize(Number(e.target.value))}>
              <option value="10">10 / page</option>
              <option value="25">25 / page</option>
              <option value="50">50 / page</option>
            </select>
          </div>
          <div className="table-wrap" style={{ border: "none", borderRadius: 0 }}>
            <table className="data-table" aria-label="Leads data grid">
              <thead>
                <tr>
                  <th onClick={() => handleSort("id")} className={sortKey === "id" ? "sorted" : ""}>Lead ID <i className={`fa-solid sort-icon ${sortIcon("id")}`}></i></th>
                  <th onClick={() => handleSort("leadName")} className={sortKey === "leadName" ? "sorted" : ""}>Name <i className={`fa-solid sort-icon ${sortIcon("leadName")}`}></i></th>
                  <th onClick={() => handleSort("businessName")} className={sortKey === "businessName" ? "sorted" : ""}>Business <i className={`fa-solid sort-icon ${sortIcon("businessName")}`}></i></th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th onClick={() => handleSort("category")} className={sortKey === "category" ? "sorted" : ""}>Category <i className={`fa-solid sort-icon ${sortIcon("category")}`}></i></th>
                  <th onClick={() => handleSort("leadStatus")} className={sortKey === "leadStatus" ? "sorted" : ""}>Status <i className={`fa-solid sort-icon ${sortIcon("leadStatus")}`}></i></th>
                  <th>Source</th>
                  <th>Added By</th>
                  <th onClick={() => handleSort("addedDate")} className={sortKey === "addedDate" ? "sorted" : ""}>Date <i className={`fa-solid sort-icon ${sortIcon("addedDate")}`}></i></th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagedLeads.length === 0 ? (
                  <tr><td colSpan="11" className="table-empty"><i className="fa-solid fa-inbox"></i>No leads found. Add a lead or adjust your filters.</td></tr>
                ) : pagedLeads.map(l => {
                  const catColor = categoryColor(l.category, categories);
                  const catDisplay = l.category === "Other" && l.customCategory ? l.customCategory : l.category;
                  return (
                    <tr key={l.id}>
                      <td className="cell-mono">{l.id}</td>
                      <td className="cell-primary">{l.leadName}</td>
                      <td>{l.businessName}</td>
                      <td><button type="button" className="copy-btn" onClick={() => handleCopy(l.email)} title="Copy email">{l.email} <i className="fa-regular fa-copy"></i></button></td>
                      <td>{l.phone ? <button type="button" className="copy-btn" onClick={() => handleCopy(l.phone)} title="Copy phone">{l.phone} <i className="fa-regular fa-copy"></i></button> : "\u2014"}</td>
                      <td><span className="category-badge" style={{ background: catColor + "18", color: catColor, borderColor: catColor + "30" }}><span className="category-badge__dot" style={{ background: catColor }}></span>{catDisplay}</span></td>
                      <td><span className={`badge ${statusBadgeClass(l.leadStatus)}`}>{l.leadStatus}</span></td>
                      <td>{l.leadSource}</td>
                      <td>{l.addedBy}</td>
                      <td>{l.addedDate}</td>
                      <td><div className="table-actions">
                        <button type="button" className="btn btn--ghost btn--sm" title="View" onClick={() => setViewLead(l)}><i className="fa-solid fa-eye"></i></button>
                        <button type="button" className="btn btn--ghost btn--sm" title="Edit" onClick={() => openEditForm(l)}><i className="fa-solid fa-pen"></i></button>
                        <button type="button" className="btn btn--ghost btn--sm" title="Delete" style={{ color: "var(--red)" }} onClick={() => setDeleteTarget(l)}><i className="fa-solid fa-trash"></i></button>
                      </div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <span>Showing {filteredLeads.length === 0 ? 0 : (effectivePage - 1) * pageSize + 1}\u2013{Math.min(effectivePage * pageSize, filteredLeads.length)} of {filteredLeads.length}</span>
            <div className="pagination__controls">
              <button type="button" className="pagination__btn" disabled={effectivePage <= 1} onClick={() => setPage(p => p - 1)}><i className="fa-solid fa-chevron-left"></i></button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).filter(i => totalPages <= 7 || i <= 3 || i >= totalPages - 2 || Math.abs(i - effectivePage) <= 1).map((i, idx, arr) => {
                const items = [];
                if (idx > 0 && arr[idx - 1] !== i - 1) items.push(<span key={`e${i}`} style={{ padding: "0 0.25rem" }}>\u2026</span>);
                items.push(<button key={i} type="button" className={`pagination__btn ${i === effectivePage ? "pagination__btn--active" : ""}`} onClick={() => setPage(i)}>{i}</button>);
                return items;
              })}
              <button type="button" className="pagination__btn" disabled={effectivePage >= totalPages} onClick={() => setPage(p => p + 1)}><i className="fa-solid fa-chevron-right"></i></button>
            </div>
          </div>
        </div>
      </section>

      <Modal open={!!viewLead} onClose={() => setViewLead(null)} title={viewLead ? `${viewLead.leadName} \u2014 ${viewLead.businessName}` : "Lead Details"} size="lg"
        footer={<>
          <button type="button" className="btn btn--secondary" onClick={() => setViewLead(null)}>Close</button>
          <button type="button" className="btn btn--primary" onClick={() => { const l = viewLead; setViewLead(null); openEditForm(l); }}><i className="fa-solid fa-pen"></i> Edit</button>
        </>}>
        {viewLead && (
          <div className="detail-grid">
            {[
              ["Lead ID", viewLead.id],
              ["Status", <span key="s" className={`badge ${statusBadgeClass(viewLead.leadStatus)}`}>{viewLead.leadStatus}</span>],
              ["Lead Name", viewLead.leadName],
              ["Business", viewLead.businessName],
              ["Email", viewLead.email],
              ["Phone", viewLead.phone || "\u2014"],
              ["Website", viewLead.website ? <a key="w" href={viewLead.website} target="_blank" rel="noopener noreferrer">{viewLead.website}</a> : "\u2014"],
              ["Category", viewLead.category === "Other" && viewLead.customCategory ? viewLead.customCategory : viewLead.category],
              ["Source", viewLead.leadSource],
              ["City", viewLead.city || "\u2014"],
              ["State", viewLead.state || "\u2014"],
              ["Country", viewLead.country || "\u2014"],
              ["Address", viewLead.address || "\u2014"],
              ["Added By", viewLead.addedBy],
              ["Added Date", `${viewLead.addedDate} ${viewLead.addedTime}`],
            ].map(([label, value]) => (
              <div key={label} className="detail-item"><div className="detail-item__label">{label}</div><div className="detail-item__value">{value}</div></div>
            ))}
          </div>
        )}
        {viewLead?.description && <div style={{ marginTop: "1rem" }}><div className="detail-item__label">Description</div><div className="detail-item__value">{viewLead.description}</div></div>}
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Lead" size="sm"
        footer={<>
          <button type="button" className="btn btn--ghost" onClick={() => setDeleteTarget(null)}>Cancel</button>
          <button type="button" className="btn btn--danger" onClick={handleDelete}><i className="fa-solid fa-trash"></i> Delete</button>
        </>}>
        <p>Are you sure you want to delete <strong>{deleteTarget?.leadName}</strong>? This action cannot be undone.</p>
      </Modal>

      <Modal open={importOpen} onClose={() => { setImportOpen(false); setImportRows([]); }} title="Import Leads from CSV"
        footer={<>
          <button type="button" className="btn btn--ghost" onClick={() => { setImportOpen(false); setImportRows([]); }}>Cancel</button>
          <button type="button" className="btn btn--primary" disabled={importRows.length === 0} onClick={handleImport}><i className="fa-solid fa-file-import"></i> Import</button>
        </>}>
        <div className="backup-zone" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (e.dataTransfer.files[0]) handleImportFile(e.dataTransfer.files[0]); }}>
          <i className="fa-solid fa-cloud-arrow-up"></i>
          <p>Drag &amp; drop a CSV file here, or <label style={{ color: "var(--accent)", cursor: "pointer", fontWeight: 600 }}>browse<input type="file" accept=".csv" hidden onChange={e => { if (e.target.files[0]) handleImportFile(e.target.files[0]); }} /></label></p>
          <p className="form-hint">Columns: Lead Name, Business Name, Email, Phone, Website, Category, etc.</p>
        </div>
        {importRows.length > 0 && (
          <div style={{ marginTop: "1rem" }}>
            <p className="form-label">Preview: {importRows.length} leads ready to import</p>
          </div>
        )}
      </Modal>
    </Layout>
  );
}
