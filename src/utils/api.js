const BASE = import.meta.env.VITE_API_URL || "";

export const LEAD_STATUSES = ["New", "Contacted", "Qualified", "Proposal", "Negotiation", "Won", "Lost"];
export const LEAD_SOURCES = ["Website", "Referral", "LinkedIn", "Cold Call", "Event", "Advertisement", "Other"];

function getToken() {
  return localStorage.getItem("leadflow_token");
}

export function getSession() {
  try {
    const raw = localStorage.getItem("leadflow_session");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setSessionData(data) {
  localStorage.setItem("leadflow_session", JSON.stringify(data));
}

export function clearSessionData() {
  localStorage.removeItem("leadflow_token");
  localStorage.removeItem("leadflow_session");
}

export function isAdmin(session) {
  return session && session.role === "admin";
}

async function request(method, path, body) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const opts = { method, headers };
  if (body && method !== "GET") opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 401) {
      clearSessionData();
      window.location.href = "/login";
    }
    throw new Error(data.error || "Request failed");
  }
  return data;
}

export function formatISODate(d) {
  d = d instanceof Date ? d : new Date(d);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatDisplayDate(iso) {
  if (!iso) return "\u2014";
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function formatDisplayDateTime(iso) {
  if (!iso) return "\u2014";
  return new Date(iso).toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function escapeHtml(str) {
  if (str == null) return "";
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
  return Promise.resolve();
}

export function animateCounter(el, target, duration = 1200) {
  let startTime = null;
  function step(ts) {
    if (!startTime) startTime = ts;
    const progress = Math.min((ts - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(target * eased).toLocaleString();
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target.toLocaleString();
  }
  requestAnimationFrame(step);
}

export function statusBadgeClass(status) {
  const map = { New: "badge--info", Contacted: "badge--purple", Qualified: "badge--accent", Proposal: "badge--warning", Negotiation: "badge--warning", Won: "badge--success", Lost: "badge--danger" };
  return map[status] || "badge--neutral";
}

export async function login(username, password, remember) {
  const data = await request("POST", "/api/auth/login", { username, password });
  localStorage.setItem("leadflow_token", data.token);
  const session = { userId: data.user.userId, username: data.user.username, role: data.user.role, name: data.user.name, email: data.user.email, avatarColor: data.user.avatarColor, loggedInAt: data.user.loggedInAt, remember: !!remember };
  setSessionData(session);
  return session;
}

export async function register(username, password, name, email) {
  const data = await request("POST", "/api/auth/register", { username, password, name, email });
  localStorage.setItem("leadflow_token", data.token);
  const session = { userId: data.user.userId, username: data.user.username, role: data.user.role, name: data.user.name, email: data.user.email, avatarColor: data.user.avatarColor, loggedInAt: data.user.loggedInAt, remember: false };
  setSessionData(session);
  return session;
}

export async function logout() {
  try {
    const session = getSession();
    if (session) await request("GET", "/api/auth/me");
  } catch {}
  clearSessionData();
}

export async function getCurrentUser() {
  const data = await request("GET", "/api/auth/me");
  return {
    _id: data.userId, id: data.userId, username: data.username, role: data.role,
    name: data.name, email: data.email, phone: data.phone, title: data.title,
    department: data.department, bio: data.bio, avatarColor: data.avatarColor,
    createdAt: data.createdAt, lastLogin: data.lastLogin,
  };
}

export async function updateProfile(userId, updates) {
  return request("PUT", "/api/settings/profile", updates);
}

export async function getLeads() {
  return request("GET", "/api/leads");
}

export async function getLeadStats() {
  return request("GET", "/api/leads/stats");
}

export async function addLead(data) {
  return request("POST", "/api/leads", data);
}

export async function updateLead(id, data) {
  return request("PUT", `/api/leads/${encodeURIComponent(id)}`, data);
}

export async function deleteLead(id) {
  return request("DELETE", `/api/leads/${encodeURIComponent(id)}`);
}

export async function importLeads(leads) {
  return request("POST", "/api/leads/import", { leads });
}

export async function getCategories() {
  return request("GET", "/api/categories");
}

export async function addCategory(data) {
  return request("POST", "/api/categories", data);
}

export async function updateCategory(id, data) {
  return request("PUT", `/api/categories/${encodeURIComponent(id)}`, data);
}

export async function deleteCategory(id) {
  return request("DELETE", `/api/categories/${encodeURIComponent(id)}`);
}

export async function getUsers() {
  return request("GET", "/api/users");
}

export async function addUser(data) {
  return request("POST", "/api/users", data);
}

export async function updateUser(id, data) {
  return request("PUT", `/api/users/${encodeURIComponent(id)}`, data);
}

export async function deleteUser(id) {
  return request("DELETE", `/api/users/${encodeURIComponent(id)}`);
}

export async function getActivities(type) {
  const q = type ? `?type=${type}` : "";
  return request("GET", `/api/activities${q}`);
}

export async function getSettings() {
  return request("GET", "/api/settings");
}

export async function saveSettings(settings) {
  return request("PUT", "/api/settings", settings);
}

export async function exportAllData() {
  return request("GET", "/api/backup/export");
}

export async function importAllData(payload) {
  return request("POST", "/api/backup/import", payload);
}

export async function resetAllData() {
  return request("POST", "/api/backup/reset");
}

export function categoryColor(name, categories) {
  const cat = categories.find(c => c.name === name);
  return cat ? cat.color : "#9AA3B5";
}

export function leadsToCSV(leads) {
  const headers = ["ID", "Lead Name", "Business Name", "Email", "Phone", "Website", "Category", "Custom Category", "City", "State", "Country", "Address", "Description", "Lead Source", "Lead Status", "Added Date", "Added Time", "Added By"];
  const rows = leads.map(l => {
    return [l.id, l.leadName, l.businessName, l.email, l.phone, l.website, l.category, l.customCategory, l.city, l.state, l.country, l.address, l.description, l.leadSource, l.leadStatus, l.addedDate, l.addedTime, l.addedBy].map(v => {
      v = v == null ? "" : String(v);
      if (v.includes(",") || v.includes('"') || v.includes("\n")) return `"${v.replace(/"/g, '""')}"`;
      return v;
    }).join(",");
  });
  return headers.join(",") + "\n" + rows.join("\n");
}

export function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = parseCSVLine(lines[0]);
  const leads = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = parseCSVLine(lines[i]);
    if (vals.length < 2) continue;
    const obj = {};
    headers.forEach((h, idx) => { obj[h.trim().toLowerCase().replace(/\s+/g, "")] = vals[idx] || ""; });
    leads.push({ leadName: obj.leadname || obj.name || "", businessName: obj.businessname || "", email: obj.email || "", phone: obj.phone || "", website: obj.website || "", category: obj.category || "Other", customCategory: obj.customcategory || "", city: obj.city || "", state: obj.state || "", country: obj.country || "", address: obj.address || "", description: obj.description || "", leadSource: obj.leadsource || "Website", leadStatus: obj.leadstatus || "New" });
  }
  return leads;
}

function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) { result.push(current); current = ""; }
    else current += ch;
  }
  result.push(current);
  return result;
}

export function downloadFile(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
