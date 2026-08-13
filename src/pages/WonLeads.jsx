import { useState, useEffect, useCallback } from "react";
import { Navigate } from "react-router-dom";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import FilterDropdown from "../components/FilterDropdown";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import {
  getWonLeads, removeFromWon, getCategories,
  categoryColor, statusBadgeClass, copyToClipboard, LEAD_STATUSES
} from "../utils/api";

export default function WonLeads() {
  const { isAdmin } = useAuth();
  const { showToast } = useToast();
  const [leads, setLeads] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterOwner, setFilterOwner] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewLead, setViewLead] = useState(null);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [removing, setRemoving] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [leadsData, catsData] = await Promise.all([getWonLeads(), getCategories()]);
      setLeads(leadsData);
      setCategories(catsData);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => { setPage(1); }, [searchQuery, filterStatus, filterCategory, filterOwner, pageSize]);

  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  const filteredLeads = leads.filter(l => {
    if (filterStatus && l.leadStatus !== filterStatus) return false;
    if (filterCategory && l.category !== filterCategory) return false;
    if (filterOwner && l.addedBy !== filterOwner) return false;
    if (!searchQuery) return true;
    const hay = [l.id, l.leadName, l.businessName, l.email, l.phone, l.category, l.customCategory, l.city, l.leadStatus, l.leadSource, l.addedBy].join(" ").toLowerCase();
    return hay.includes(searchQuery.toLowerCase());
  });

  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / pageSize));
  const effectivePage = Math.min(page, totalPages);
  const pagedLeads = filteredLeads.slice((effectivePage - 1) * pageSize, effectivePage * pageSize);

  const uniqueOwners = [...new Set(leads.map(l => l.addedBy))].sort();

  const handleCopy = (text) => {
    copyToClipboard(text).then(() => showToast("Copied to clipboard.", "success"));
  };

  const handleRemove = async () => {
    if (!removeTarget) return;
    setRemoving(true);
    try {
      await removeFromWon(removeTarget.id);
      showToast(`Lead "${removeTarget.leadName}" removed from Won Leads.`, "success");
      setLeads(ls => ls.filter(l => l.id !== removeTarget.id));
      setRemoveTarget(null);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setRemoving(false);
    }
  };

  if (loading) {
    return (
      <Layout activePage="won">
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "2rem", color: "var(--accent)" }}></i>
        </div>
      </Layout>
    );
  }

  return (
    <Layout activePage="won">
      <div className="page-header">
        <div>
          <h1 className="page-title">Won Leads</h1>
          <p className="page-subtitle">Leads that reached the Won stage. Only admins can remove them from this page.</p>
        </div>
      </div>

      <section className="panel-card">
        <div className="panel-card__header">
          <h2 className="panel-card__title"><i className="fa-solid fa-trophy"></i> Won Leads</h2>
          <span className="badge badge--success">{leads.length} won</span>
        </div>
        <div className="panel-card__body" style={{ padding: 0 }}>
          <div className="table-toolbar dashboard-toolbar" style={{ padding: "1rem 1.35rem 0" }}>
            <button type="button" className="btn btn--ghost btn--sm filters-toggle" aria-expanded={filtersOpen} onClick={() => setFiltersOpen(o => !o)}>
              <i className={`fa-solid ${filtersOpen ? "fa-xmark" : "fa-sliders"}`}></i> {filtersOpen ? "Hide Filters" : "Filters"}
            </button>
            <div className={`filters-toggle__body ${filtersOpen ? "filters-toggle__body--open" : ""}`}>
              <div className="table-toolbar__search">
                <i className="fa-solid fa-magnifying-glass"></i>
                <input type="search" placeholder="Search won leads\u2026" aria-label="Search won leads table" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
              <FilterDropdown
                label="All Statuses"
                icon="fa-solid fa-circle-dot"
                options={[{ value: "", label: "All Statuses" }, ...LEAD_STATUSES.map(s => ({ value: s, label: s }))]}
                value={filterStatus}
                onChange={setFilterStatus}
              />
              <FilterDropdown
                label="All Categories"
                icon="fa-solid fa-tag"
                options={[{ value: "", label: "All Categories" }, ...categories.map(c => ({ value: c.name, label: c.name }))]}
                value={filterCategory}
                onChange={setFilterCategory}
              />
              <FilterDropdown
                label="All Owners"
                icon="fa-solid fa-user"
                options={[{ value: "", label: "All Owners" }, ...uniqueOwners.map(o => ({ value: o, label: o }))]}
                value={filterOwner}
                onChange={setFilterOwner}
              />
              <FilterDropdown
                label="Rows"
                icon="fa-solid fa-list"
                options={[{ value: "10", label: "10 / page" }, { value: "25", label: "25 / page" }, { value: "50", label: "50 / page" }]}
                value={String(pageSize)}
                onChange={(v) => setPageSize(Number(v))}
              />
            </div>
          </div>
          <div className="table-wrap leads-desktop-table" style={{ border: "none", borderRadius: 0 }}>
            <table className="data-table" aria-label="Won leads data grid">
              <thead>
                <tr>
                  <th>Lead ID</th>
                  <th>Name</th>
                  <th>Business</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Category</th>
                  <th>Current Status</th>
                  <th>Source</th>
                  <th>Added By</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagedLeads.length === 0 ? (
                  <tr><td colSpan="11" className="table-empty"><i className="fa-solid fa-trophy"></i>No won leads found. Mark a lead as Won to add it here, or adjust your filters.</td></tr>
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
                        <button type="button" className="btn btn--ghost btn--sm" title="Remove from Won" style={{ color: "var(--red)" }} onClick={() => setRemoveTarget(l)}><i className="fa-solid fa-xmark"></i></button>
                      </div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="leads-cards">
            {pagedLeads.length === 0 ? (
              <div className="table-empty"><i className="fa-solid fa-trophy"></i>No won leads found. Mark a lead as Won to add it here, or adjust your filters.</div>
            ) : pagedLeads.map(l => {
              const catColor = categoryColor(l.category, categories);
              const catDisplay = l.category === "Other" && l.customCategory ? l.customCategory : l.category;
              return (
                <div key={l.id} className="lead-card">
                  <div className="lead-card__top">
                    <div>
                      <div className="lead-card__name">{l.leadName || "\u2014"}</div>
                      <div className="lead-card__business">{l.businessName}</div>
                    </div>
                    <div className="lead-card__actions">
                      <button type="button" className="btn btn--ghost btn--sm" title="View" onClick={() => setViewLead(l)}><i className="fa-solid fa-eye"></i></button>
                      <button type="button" className="btn btn--ghost btn--sm" title="Remove from Won" style={{ color: "var(--red)" }} onClick={() => setRemoveTarget(l)}><i className="fa-solid fa-xmark"></i></button>
                    </div>
                  </div>
                  <div className="lead-card__badges">
                    <span className={`badge ${statusBadgeClass(l.leadStatus)}`}>{l.leadStatus}</span>
                    <span className="category-badge" style={{ background: catColor + "18", color: catColor, borderColor: catColor + "30" }}><span className="category-badge__dot" style={{ background: catColor }}></span>{catDisplay}</span>
                  </div>
                  <div className="lead-card__meta">
                    {l.email && <span><i className="fa-regular fa-envelope"></i><button type="button" className="copy-btn" onClick={() => handleCopy(l.email)} title="Copy email">{l.email} <i className="fa-regular fa-copy"></i></button></span>}
                    {l.phone && <span><i className="fa-solid fa-phone"></i><button type="button" className="copy-btn" onClick={() => handleCopy(l.phone)} title="Copy phone">{l.phone} <i className="fa-regular fa-copy"></i></button></span>}
                    {l.city && <span><i className="fa-solid fa-location-dot"></i>{l.city}{l.state ? `, ${l.state}` : ""}</span>}
                    <span><i className="fa-regular fa-calendar"></i>{l.addedDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="pagination">
            <span>Showing {filteredLeads.length === 0 ? 0 : (effectivePage - 1) * pageSize + 1}{"\u2013"}{Math.min(effectivePage * pageSize, filteredLeads.length)} of {filteredLeads.length}</span>
            <div className="pagination__controls">
              <button type="button" className="pagination__btn" disabled={effectivePage <= 1} onClick={() => setPage(p => p - 1)}><i className="fa-solid fa-chevron-left"></i></button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).filter(i => totalPages <= 7 || i <= 3 || i >= totalPages - 2 || Math.abs(i - effectivePage) <= 1).map((i, idx, arr) => {
                const items = [];
                if (idx > 0 && arr[idx - 1] !== i - 1) items.push(<span key={`e${i}`} style={{ padding: "0 0.25rem" }}>{"\u2026"}</span>);
                items.push(<button key={i} type="button" className={`pagination__btn ${i === effectivePage ? "pagination__btn--active" : ""}`} onClick={() => setPage(i)}>{i}</button>);
                return items;
              })}
              <button type="button" className="pagination__btn" disabled={effectivePage >= totalPages} onClick={() => setPage(p => p + 1)}><i className="fa-solid fa-chevron-right"></i></button>
            </div>
          </div>
        </div>
      </section>

      <Modal open={!!viewLead} onClose={() => setViewLead(null)} title={viewLead ? `${viewLead.leadName} \u2014 ${viewLead.businessName}` : "Lead Details"} size="lg"
        footer={<button type="button" className="btn btn--secondary" onClick={() => setViewLead(null)}>Close</button>}>
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

      <Modal open={!!removeTarget} onClose={() => setRemoveTarget(null)} title="Remove from Won Leads" size="sm"
        footer={<>
          <button type="button" className="btn btn--ghost" onClick={() => setRemoveTarget(null)}>Cancel</button>
          <button type="button" className="btn btn--danger" disabled={removing} onClick={handleRemove}><i className="fa-solid fa-xmark"></i> {removing ? "Removing\u2026" : "Remove"}</button>
        </>}>
        <p>Remove <strong>{removeTarget?.leadName}</strong> from the Won Leads page? The lead will remain in the Dashboard with its current status.</p>
      </Modal>
    </Layout>
  );
}
