import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { getCategory, getProjects, addProject, updateProject, deleteProject, escapeHtml, statusBadgeClass } from "../utils/api";

export default function CategoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { showToast } = useToast();

  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState([]);

  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  const [projectModal, setProjectModal] = useState(false);
  const [editProjectId, setEditProjectId] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectGithub, setProjectGithub] = useState("");
  const [projectProduction, setProjectProduction] = useState("");
  const [projectSaving, setProjectSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchProjects = useCallback(() => {
    setProjectsLoading(true);
    getProjects(id)
      .then(data => { setProjects(data); setProjectsLoading(false); })
      .catch(() => setProjectsLoading(false));
  }, [id]);

  useEffect(() => {
    getCategory(id)
      .then(data => {
        setCategory(data);
        setLeads(data.leads || []);
        setLoading(false);
      })
      .catch(err => {
        showToast(err.message, "error");
        navigate("/categories", { replace: true });
      });
  }, [id, navigate, showToast]);

  useEffect(() => {
    if (!loading) fetchProjects();
  }, [loading, fetchProjects]);

  const openAdd = () => {
    setEditProjectId("");
    setProjectName("");
    setProjectGithub("");
    setProjectProduction("");
    setProjectModal(true);
  };

  const openEdit = (p) => {
    setEditProjectId(p._id);
    setProjectName(p.name);
    setProjectGithub(p.githubUrl || "");
    setProjectProduction(p.productionUrl || "");
    setProjectModal(true);
  };

  const saveProject = async () => {
    if (!projectName.trim()) { showToast("Project name is required.", "error"); return; }
    setProjectSaving(true);
    try {
      const data = { name: projectName.trim(), githubUrl: projectGithub, productionUrl: projectProduction };
      if (editProjectId) await updateProject(id, editProjectId, data);
      else await addProject(id, data);
      showToast(editProjectId ? "Project updated." : "Project added.", "success");
      setProjectModal(false);
      fetchProjects();
    } catch (err) { showToast(err.message, "error"); }
    setProjectSaving(false);
  };

  const handleDelete = async () => {
    try {
      await deleteProject(id, deleteTarget._id);
      showToast("Project deleted.", "success");
      setDeleteTarget(null);
      fetchProjects();
    } catch (err) { showToast(err.message, "error"); }
  };

  if (loading) {
    return (
      <Layout activePage="categories">
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "2rem", color: "var(--accent)" }}></i>
        </div>
      </Layout>
    );
  }

  return (
    <Layout activePage="categories">
      <div className="page-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Link to="/categories" className="btn btn--ghost btn--sm">
              <i className="fa-solid fa-arrow-left"></i>
            </Link>
            <span className="category-badge" style={{ background: category.color + "18", color: category.color, borderColor: category.color + "30", padding: "0.25rem 0.75rem" }}>
              <span className="category-badge__dot" style={{ background: category.color }}></span>
              {escapeHtml(category.name)}
            </span>
            <span className="badge badge--neutral">{category.leadCount || 0} leads</span>
          </div>
          <p className="page-subtitle" style={{ marginTop: "0.5rem", marginLeft: "2.5rem" }}>
            {escapeHtml(category.description || "No description.")}
          </p>
        </div>
      </div>

      <div className="panel-card" style={{ marginBottom: "1.5rem" }}>
        <div className="panel-card__header">
          <h2 className="panel-card__title"><i className="fa-solid fa-folder-open"></i> Projects ({projects.length})</h2>
          {isAdmin && <button type="button" className="btn btn--primary btn--sm" onClick={openAdd}><i className="fa-solid fa-plus"></i> Add Project</button>}
        </div>
        <div className="panel-card__body">
          {projectsLoading ? (
            <div style={{ textAlign: "center", padding: "2rem" }}><i className="fa-solid fa-spinner fa-spin" style={{ color: "var(--accent)" }}></i></div>
          ) : projects.length === 0 ? (
            <div className="table-empty"><i className="fa-solid fa-folder-open"></i> No projects yet.</div>
          ) : (
            <div style={{ display: "grid", gap: "0.75rem" }}>
              {projects.map(p => (
                <div key={p._id} className="category-card" style={{ padding: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600 }}>{escapeHtml(p.name)}</h4>
                      {p.createdBy && <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>Added by {p.createdBy}</span>}
                    </div>
                    {isAdmin && (
                      <div style={{ display: "flex", gap: "0.35rem" }}>
                        <button type="button" className="btn btn--ghost btn--sm" onClick={() => openEdit(p)}><i className="fa-solid fa-pen"></i></button>
                        <button type="button" className="btn btn--ghost btn--sm" style={{ color: "var(--red)" }} onClick={() => setDeleteTarget(p)}><i className="fa-solid fa-trash"></i></button>
                      </div>
                    )}
                  </div>
                  <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem" }}>
                    {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="btn btn--secondary btn--sm"><i className="fa-brands fa-github"></i> GitHub</a>}
                    {p.productionUrl && <a href={p.productionUrl} target="_blank" rel="noopener noreferrer" className="btn btn--secondary btn--sm"><i className="fa-solid fa-arrow-up-right-from-square"></i> Live Site</a>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="panel-card">
        <div className="panel-card__header">
          <h2 className="panel-card__title"><i className="fa-solid fa-list"></i> Leads ({leads.length})</h2>
        </div>
        <div className="panel-card__body" style={{ padding: 0 }}>
          {leads.length === 0 ? (
            <div className="table-empty" style={{ padding: "2rem" }}>
              <i className="fa-solid fa-inbox"></i> No leads in this category.
            </div>
          ) : (
            <div className="table-wrap" style={{ border: "none", borderRadius: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Lead ID</th>
                    <th>Name</th>
                    <th>Business</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Source</th>
                    <th>Added By</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map(l => (
                    <tr key={l.id}>
                      <td className="cell-mono">{l.id}</td>
                      <td className="cell-primary">{l.leadName}</td>
                      <td>{l.businessName}</td>
                      <td>{l.email || "\u2014"}</td>
                      <td><span className={`badge ${statusBadgeClass(l.leadStatus)}`}>{l.leadStatus}</span></td>
                      <td>{l.leadSource}</td>
                      <td>{l.addedBy}</td>
                      <td>{l.addedDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal open={projectModal} onClose={() => setProjectModal(false)} title={editProjectId ? "Edit Project" : "Add Project"} size="sm"
        footer={<>
          <button type="button" className="btn btn--ghost" onClick={() => setProjectModal(false)}>Cancel</button>
          <button type="button" className="btn btn--primary" onClick={saveProject} disabled={projectSaving}>
            <i className="fa-solid fa-check"></i> {projectSaving ? "Saving\u2026" : "Save"}
          </button>
        </>}>
        <div className="form-field">
          <label className="form-label">Project Name <span className="form-label__required">*</span></label>
          <input className="form-input" type="text" placeholder="e.g. SmileCare Dental Website" value={projectName} onChange={e => setProjectName(e.target.value)} />
        </div>
        <div className="form-field">
          <label className="form-label">GitHub URL</label>
          <div className="input-shell">
            <span className="input-shell__icon"><i className="fa-brands fa-github"></i></span>
            <input className="form-input" type="url" placeholder="https://github.com/your-org/repo" value={projectGithub} onChange={e => setProjectGithub(e.target.value)} />
          </div>
        </div>
        <div className="form-field">
          <label className="form-label">Production / Deployed URL</label>
          <div className="input-shell">
            <span className="input-shell__icon"><i className="fa-solid fa-globe"></i></span>
            <input className="form-input" type="url" placeholder="https://your-site.com" value={projectProduction} onChange={e => setProjectProduction(e.target.value)} />
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Project" size="sm"
        footer={<>
          <button type="button" className="btn btn--ghost" onClick={() => setDeleteTarget(null)}>Cancel</button>
          <button type="button" className="btn btn--danger" onClick={handleDelete}><i className="fa-solid fa-trash"></i> Delete</button>
        </>}>
        <p>Delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.</p>
      </Modal>
    </Layout>
  );
}
