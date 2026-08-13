import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import FilterDropdown from "../components/FilterDropdown";
import LocationCombobox from "../components/LocationCombobox";
import RowActions from "../components/RowActions";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import {
  getLeads, getLeadStats, addLead, updateLead, deleteLead,
  getCategories, importLeads, categoryColor, statusBadgeClass, escapeHtml,
  LEAD_STATUSES, LEAD_SOURCES, animateCounter, copyToClipboard,
  leadsToCSV, parseCSV, downloadFile, formatISODate,
  getSettings, formatDisplayDateTime
} from "../utils/api";
import {
  flagEmoji, getCountries, getStatesOfCountry, getCountryByName,
  getStateByCountryAndName, loadCities
} from "../utils/locationData";

export default function Dashboard() {
  const { session, isAdmin } = useAuth();
  const { showToast } = useToast();
  const [renderKey, setRenderKey] = useState(0);

  const [leads, setLeads] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({ total: 0, today: 0, categories: 0, myLeads: 0, won: 0 });
  const [settings, setSettingsState] = useState({});
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterOwner, setFilterOwner] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortKey, setSortKey] = useState("addedDate");
  const [sortDir, setSortDir] = useState("desc");

  const [formOpen, setFormOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [form, setForm] = useState({ leadName: "", businessName: "", email: "", phone: "", website: "", category: "Technology", customCategory: "", city: "", state: "", country: "", address: "", description: "", leadSource: "Website", leadStatus: "New" });

  const [countryCode, setCountryCode] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [stateOptions, setStateOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [citiesLoading, setCitiesLoading] = useState(false);

  const countryOptions = useMemo(
    () => getCountries().map(c => ({ value: c.isoCode, label: c.name, flag: flagEmoji(c.isoCode) })),
    []
  );

  const [viewLead, setViewLead] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importRows, setImportRows] = useState([]);
  const totalStatRef = useRef(null);
  const todayStatRef = useRef(null);
  const catStatRef = useRef(null);
  const myStatRef = useRef(null);
  const wonStatRef = useRef(null);

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
    if (wonStatRef.current) animateCounter(wonStatRef.current, stats.won);
  }, [renderKey, stats]);

  useEffect(() => { setPage(1); }, [searchQuery, filterStatus, filterCategory, filterOwner, pageSize]);

  useEffect(() => {
    if (!actionsOpen) return;
    const close = (e) => { if (!e.target.closest(".actions-dropdown")) setActionsOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [actionsOpen]);

  useEffect(() => {
    if (!countryCode) {
      setStateOptions([]);
      setCityOptions([]);
      return;
    }
    setStateOptions(getStatesOfCountry(countryCode).map(s => ({ value: s.isoCode, label: s.name })));
  }, [countryCode]);

  useEffect(() => {
    let cancelled = false;
    if (!countryCode) {
      setCityOptions([]);
      setCitiesLoading(false);
      return;
    }
    const hasStates = getStatesOfCountry(countryCode).length > 0;
    if (hasStates && !stateCode) {
      setCityOptions([]);
      setCitiesLoading(false);
      return;
    }
    setCitiesLoading(true);
    loadCities(countryCode, stateCode)
      .then(names => { if (!cancelled) setCityOptions(names.map(n => ({ value: n, label: n }))); })
      .catch(() => { if (!cancelled) setCityOptions([]); })
      .finally(() => { if (!cancelled) setCitiesLoading(false); });
    return () => { cancelled = true; };
  }, [countryCode, stateCode]);

  const openAddForm = () => {
    setEditLead(null);
    setCountryCode("IN");
    setStateCode("MH");
    setForm({ leadName: "", businessName: "", email: "", phone: "", website: "", category: categories[0]?.name || "Technology", customCategory: "", city: "", state: "Maharashtra", country: "India", address: "", description: "", leadSource: settings.defaultLeadSource || "Website", leadStatus: settings.defaultLeadStatus || "New" });
    setFormOpen(true);
  };

  const openEditForm = (lead) => {
    setEditLead(lead);
    const country = getCountryByName(lead.country || "");
    const cCode = country ? country.isoCode : "";
    const sCode = cCode ? getStateByCountryAndName(cCode, lead.state)?.isoCode || "" : "";
    setCountryCode(cCode);
    setStateCode(sCode);
    setForm({ leadName: lead.leadName, businessName: lead.businessName, email: lead.email, phone: lead.phone || "", website: lead.website || "", category: lead.category, customCategory: lead.customCategory || "", city: lead.city || "", state: lead.state || "", country: lead.country || "", address: lead.address || "", description: lead.description || "", leadSource: lead.leadSource, leadStatus: lead.leadStatus });
    setFormOpen(true);
  };

  const handleCountrySelect = (opt) => {
    if (!opt) {
      setCountryCode("");
      setStateCode("");
      setForm(f => ({ ...f, country: "", state: "", city: "" }));
      return;
    }
    setCountryCode(opt.value);
    setStateCode("");
    setForm(f => ({ ...f, country: opt.label, state: "", city: "" }));
  };

  const handleStateSelect = (opt) => {
    if (!opt) {
      setStateCode("");
      setForm(f => ({ ...f, state: "", city: "" }));
      return;
    }
    setStateCode(opt.value);
    setForm(f => ({ ...f, state: opt.label, city: "" }));
  };

  const handleCitySelect = (opt) => {
    setForm(f => ({ ...f, city: opt ? opt.label : "" }));
  };

  const selectedCountry = countryCode
    ? countryOptions.find(o => o.value === countryCode) || { value: countryCode, label: form.country }
    : (form.country ? { value: "__unknown", label: form.country } : null);

  const selectedState = stateCode
    ? stateOptions.find(o => o.value === stateCode) || { value: stateCode, label: form.state }
    : (form.state ? { value: "__unknown", label: form.state } : null);

  const selectedCity = form.city ? { value: form.city, label: form.city } : null;

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.businessName) { showToast("Business name is required.", "error"); return; }
    if (!form.phone) { showToast("Phone number is required.", "error"); return; }
    if (!form.phone) { showToast("Phone number is required.", "error"); return; }
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
          <div className="actions-dropdown" style={{ position: "relative" }}>
            <button type="button" className="btn btn--secondary btn--sm" onClick={() => setActionsOpen(o => !o)}>
              <i className="fa-solid fa-bars"></i> Actions <i className="fa-solid fa-chevron-down" style={{ fontSize: "0.65rem", marginLeft: "0.25rem" }}></i>
            </button>
            {actionsOpen && (
              <div className="actions-dropdown__menu">
                <button type="button" className="actions-dropdown__item" onClick={() => { setActionsOpen(false); setImportOpen(true); }}>
                  <i className="fa-solid fa-file-import"></i> Import CSV
                </button>
                <button type="button" className="actions-dropdown__item" onClick={() => { setActionsOpen(false); exportCSV(); }}>
                  <i className="fa-solid fa-file-csv"></i> Export CSV
                </button>
                <button type="button" className="actions-dropdown__item" onClick={() => { setActionsOpen(false); exportJSON(); }}>
                  <i className="fa-solid fa-file-code"></i> Export JSON
                </button>
                <div className="actions-dropdown__divider"></div>
                <button type="button" className="actions-dropdown__item" onClick={() => { setActionsOpen(false); window.print(); }}>
                  <i className="fa-solid fa-print"></i> Print
                </button>
              </div>
            )}
          </div>
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
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--gold"><i className="fa-solid fa-trophy"></i></div>
          <div>
            <div className="stat-card__label">Won Leads</div>
            <div className="stat-card__value" ref={wonStatRef}>0</div>
            <div className="stat-card__meta">Closed-won pipeline</div>
          </div>
        </div>
      </div>

      <Modal open={formOpen} onClose={() => { setFormOpen(false); setEditLead(null); }} title={editLead ? "Edit Lead" : "Add New Lead"} size="lg"
        footer={<>
          <button type="button" className="btn btn--ghost" onClick={() => { setFormOpen(false); setEditLead(null); }}>Cancel</button>
          <button type="submit" className="btn btn--primary" form="lead-form"><i className="fa-solid fa-check"></i> {editLead ? "Update Lead" : "Save Lead"}</button>
        </>}>
        <form id="lead-form" onSubmit={handleFormSubmit} noValidate>
          <div className="form-grid form-grid--3">
            <div className="form-field">
              <label className="form-label" htmlFor="leadName">Lead Name</label>
              <input className="form-input" type="text" id="leadName" placeholder="Full name" value={form.leadName} onChange={e => setForm({ ...form, leadName: e.target.value })} />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="businessName">Business Name <span className="form-label__required">*</span></label>
              <input className="form-input" type="text" id="businessName" required placeholder="Company name" value={form.businessName} onChange={e => setForm({ ...form, businessName: e.target.value })} />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="email">Email</label>
              <input className="form-input" type="email" id="email" placeholder="email@company.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="phone">Phone <span className="form-label__required">*</span></label>
              <input className="form-input" type="tel" id="phone" required placeholder="+1 (555) 000-0000" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="website">Website</label>
              <input className="form-input" type="url" id="website" placeholder="https://example.com" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} />
            </div>
            <div className="form-field">
              <LocationCombobox
                label="Category"
                value={form.category ? { value: form.category, label: form.category } : null}
                options={categories.map(c => ({ value: c.name, label: c.name }))}
                onSelect={(opt) => setForm({ ...form, category: opt ? opt.label : "" })}
                placeholder="Select category"
                searchable={false}
                clearable={false}
                required
              />
            </div>
            {form.category === "Other" && (
              <div className="form-field">
                <label className="form-label" htmlFor="customCategory">Custom Category</label>
                <input className="form-input" type="text" id="customCategory" placeholder="Enter custom category" value={form.customCategory} onChange={e => setForm({ ...form, customCategory: e.target.value })} />
              </div>
            )}
            <div className="form-field">
              <LocationCombobox
                label="Country"
                value={selectedCountry}
                options={countryOptions}
                onSelect={handleCountrySelect}
                placeholder="Select country"
                searchPlaceholder="Search countries\u2026"
              />
            </div>
            <div className="form-field">
              <LocationCombobox
                label="State / Province"
                value={selectedState}
                options={stateOptions}
                onSelect={handleStateSelect}
                placeholder={countryCode ? "Select state" : "Select country first"}
                searchPlaceholder="Search states\u2026"
                disabled={!countryCode}
              />
            </div>
            <div className="form-field">
              <LocationCombobox
                label="City"
                value={selectedCity}
                options={cityOptions}
                onSelect={handleCitySelect}
                placeholder={countryCode ? "Select city" : "Select country first"}
                searchPlaceholder="Search cities\u2026"
                disabled={!countryCode}
                loading={citiesLoading}
                loadingText="Loading cities\u2026"
              />
            </div>
            <div className="form-field">
              <LocationCombobox
                label="Lead Source"
                value={form.leadSource ? { value: form.leadSource, label: form.leadSource } : null}
                options={LEAD_SOURCES.map(s => ({ value: s, label: s }))}
                onSelect={(opt) => setForm({ ...form, leadSource: opt ? opt.label : "" })}
                placeholder="Select lead source"
                searchable={false}
                clearable={false}
              />
            </div>
            <div className="form-field">
              <LocationCombobox
                label="Lead Status"
                value={form.leadStatus ? { value: form.leadStatus, label: form.leadStatus } : null}
                options={LEAD_STATUSES.map(s => ({ value: s, label: s }))}
                onSelect={(opt) => setForm({ ...form, leadStatus: opt ? opt.label : "" })}
                placeholder="Select lead status"
                searchable={false}
                clearable={false}
              />
            </div>
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="address">Address</label>
            <input className="form-input" type="text" id="address" placeholder="Street address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="description">Description</label>
            <textarea className="form-textarea" id="description" placeholder="Notes about this lead…" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}></textarea>
          </div>
          {editLead && (
            <div className="form-grid form-grid--2">
              <div className="form-field"><label className="form-label">Lead ID</label><input className="form-input" type="text" value={editLead.id} readOnly /></div>
              <div className="form-field"><label className="form-label">Added By</label><input className="form-input" type="text" value={editLead.addedBy} readOnly /></div>
              <div className="form-field"><label className="form-label">Added Date</label><input className="form-input" type="text" value={editLead.addedDate} readOnly /></div>
              <div className="form-field"><label className="form-label">Added Time</label><input className="form-input" type="text" value={editLead.addedTime} readOnly /></div>
            </div>
          )}
        </form>
      </Modal>

      <section className="panel-card">
        <div className="panel-card__header">
          <h2 className="panel-card__title"><i className="fa-solid fa-table"></i> Leads</h2>
        </div>
        <div className="panel-card__body" style={{ padding: 0 }}>
          <div className="table-toolbar dashboard-toolbar" style={{ padding: "1rem 1.35rem 0" }}>
            <button type="button" className="btn btn--ghost btn--sm filters-toggle" aria-expanded={filtersOpen} onClick={() => setFiltersOpen(o => !o)}>
              <i className={`fa-solid ${filtersOpen ? "fa-xmark" : "fa-sliders"}`}></i> {filtersOpen ? "Hide Filters" : "Filters"}
            </button>
            <div className={`filters-toggle__body ${filtersOpen ? "filters-toggle__body--open" : ""}`}>
              <div className="table-toolbar__search">
                <i className="fa-solid fa-magnifying-glass"></i>
                <input type="search" placeholder="Search leads…" aria-label="Search leads table" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
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
              {isAdmin && (
                <FilterDropdown
                  label="All Owners"
                  icon="fa-solid fa-user"
                  options={[{ value: "", label: "All Owners" }, ...uniqueOwners.map(o => ({ value: o, label: o }))]}
                  value={filterOwner}
                  onChange={setFilterOwner}
                />
              )}
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
                  {isAdmin && <th>Added By</th>}
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
                      {isAdmin && <td>{l.addedBy}</td>}
                      <td>{l.addedDate}</td>
                      <td><div className="table-actions">
                        <RowActions items={[
                          { icon: "fa-eye", label: "View", onClick: () => setViewLead(l) },
                          { icon: "fa-pen", label: "Edit", onClick: () => openEditForm(l) },
                          { icon: "fa-trash", label: "Delete", danger: true, onClick: () => setDeleteTarget(l) },
                        ]} />
                      </div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="leads-cards">
            {pagedLeads.length === 0 ? (
              <div className="table-empty"><i className="fa-solid fa-inbox"></i>No leads found. Add a lead or adjust your filters.</div>
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
                      <button type="button" className="btn btn--ghost btn--sm" title="Edit" onClick={() => openEditForm(l)}><i className="fa-solid fa-pen"></i></button>
                      <button type="button" className="btn btn--ghost btn--sm" title="Delete" style={{ color: "var(--red)" }} onClick={() => setDeleteTarget(l)}><i className="fa-solid fa-trash"></i></button>
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
