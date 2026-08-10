import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import FilterDropdown from "../components/FilterDropdown";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { getCategories, addCategory, updateCategory, deleteCategory, escapeHtml } from "../utils/api";

const SWATCHES = ["#60A5FA", "#34D399", "#FBBF24", "#F87171", "#C084FC", "#9AA3B5"];

export default function Categories() {
  const { session, isAdmin } = useAuth();
  const { showToast } = useToast();
  const [renderKey, setRenderKey] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLeads, setFilterLeads] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState("#60A5FA");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const refresh = useCallback(() => setRenderKey(k => k + 1), []);

  useEffect(() => {
    getCategories().then(data => { setCategories(data); setLoading(false); }).catch(err => { showToast(err.message, "error"); setLoading(false); });
  }, [renderKey, showToast]);

  const filtered = categories.filter(c => {
    if (filterLeads === "with" && !c.leadCount) return false;
    if (filterLeads === "empty" && c.leadCount) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || (c.description || "").toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const effectivePage = Math.min(page, totalPages);
  const pagedCategories = filtered.slice((effectivePage - 1) * pageSize, effectivePage * pageSize);

  useEffect(() => { setPage(1); }, [searchQuery, filterLeads, pageSize]);

  const openAdd = () => { setEditId(""); setName(""); setDescription(""); setSelectedColor("#60A5FA"); setModalOpen(true); };
  const openEdit = (cat) => { setEditId(cat._id || cat.id); setName(cat.name); setDescription(cat.description || ""); setSelectedColor(cat.color); setModalOpen(true); };

  const save = async () => {
    if (!name.trim()) { showToast("Category name is required.", "error"); return; }
    try {
      const data = { name: name.trim(), description: description.trim(), color: selectedColor };
      if (editId) await updateCategory(editId, data);
      else await addCategory(data);
      showToast(editId ? "Category updated." : "Category created.", "success");
      setModalOpen(false);
      refresh();
    } catch (err) { showToast(err.message, "error"); }
  };

  const handleDelete = async () => {
    try {
      await deleteCategory(deleteTarget._id || deleteTarget.id);
      showToast("Category deleted.", "success");
    } catch (err) { showToast(err.message, "error"); }
    setDeleteTarget(null);
    refresh();
  };

  return (
    <Layout activePage="categories">
      <div className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">Organize leads with color-coded categories.</p>
        </div>
        <div className="page-header__actions">
          {isAdmin && <button type="button" className="btn btn--primary btn--sm" onClick={openAdd}><i className="fa-solid fa-plus"></i> Add Category</button>}
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}><i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "2rem", color: "var(--accent)" }}></i></div>
      ) : (
        <>
          <div className="table-toolbar categories-toolbar">
            <div className="table-toolbar__search">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input type="search" placeholder="Search categories…" aria-label="Search categories" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <div className="table-toolbar__filters">
              <FilterDropdown
                label="Any Leads"
                icon="fa-solid fa-chart-simple"
                options={[{ value: "", label: "Any Leads" }, { value: "with", label: "With Leads" }, { value: "empty", label: "No Leads" }]}
                value={filterLeads}
                onChange={setFilterLeads}
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

          <div className="category-grid">
            {pagedCategories.length === 0 ? (
              <div className="table-empty" style={{ gridColumn: "1/-1" }}><i className="fa-solid fa-tags"></i>No categories match your search.</div>
            ) : pagedCategories.map(c => (
              <Link to={`/categories/${c._id || c.id}`} key={c._id || c.id} className="category-card" style={{ "--cat-color": c.color, textDecoration: "none", color: "inherit" }}>
                <div className="category-card__header">
                  <span className="category-card__name">{escapeHtml(c.name)}</span>
                  <span className="badge badge--neutral">{c.leadCount || 0} leads</span>
                </div>
                <p className="category-card__desc">{escapeHtml(c.description || "No description.")}</p>
                <div className="category-card__actions" onClick={e => e.stopPropagation()}>
                  {isAdmin && <button type="button" className="btn btn--ghost btn--sm" onClick={e => { e.preventDefault(); openEdit(c); }}><i className="fa-solid fa-pen"></i> Edit</button>}
                  {c.name !== "Other" && isAdmin && (
                    <button type="button" className="btn btn--ghost btn--sm" style={{ color: "var(--red)" }} onClick={e => { e.preventDefault(); setDeleteTarget(c); }}><i className="fa-solid fa-trash"></i> Delete</button>
                  )}
                </div>
              </Link>
            ))}
          </div>

          <div className="pagination">
            <span>Showing {filtered.length === 0 ? 0 : (effectivePage - 1) * pageSize + 1}{"\u2013"}{Math.min(effectivePage * pageSize, filtered.length)} of {filtered.length}</span>
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
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? "Edit Category" : "Add Category"} size="sm"
        footer={<>
          <button type="button" className="btn btn--ghost" onClick={() => setModalOpen(false)}>Cancel</button>
          <button type="button" className="btn btn--primary" onClick={save}><i className="fa-solid fa-check"></i> Save</button>
        </>}>
        <div className="form-field">
          <label className="form-label">Name <span className="form-label__required">*</span></label>
          <input className="form-input" type="text" placeholder="Category name" value={name} onChange={e => setName(e.target.value)} readOnly={name === "Other"} />
        </div>
        <div className="form-field">
          <label className="form-label">Description</label>
          <textarea className="form-textarea" placeholder="Brief description…" value={description} onChange={e => setDescription(e.target.value)}></textarea>
        </div>
        <div className="form-field">
          <label className="form-label">Color</label>
          <div className="color-picker-row">
            {SWATCHES.map(color => (
              <button key={color} type="button" className={`color-swatch ${selectedColor === color ? "color-swatch--selected" : ""}`} style={{ background: color }} onClick={() => setSelectedColor(color)} aria-label={color}></button>
            ))}
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Category" size="sm"
        footer={<>
          <button type="button" className="btn btn--ghost" onClick={() => setDeleteTarget(null)}>Cancel</button>
          <button type="button" className="btn btn--danger" onClick={handleDelete}><i className="fa-solid fa-trash"></i> Delete</button>
        </>}>
        <p>Delete <strong>{deleteTarget?.name}</strong>? Leads using this category must be reassigned first.</p>
      </Modal>
    </Layout>
  );
}
