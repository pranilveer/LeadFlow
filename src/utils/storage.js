const KEYS = {
  USERS: "leadflow_users",
  SESSION: "leadflow_session",
  LEADS: "leadflow_leads",
  CATEGORIES: "leadflow_categories",
  ACTIVITIES: "leadflow_activities",
  SETTINGS: "leadflow_settings",
  THEME: "leadflow_theme",
  LEAD_SEQ: "leadflow_lead_seq",
};

export const LEAD_STATUSES = ["New", "Contacted", "Qualified", "Proposal", "Negotiation", "Won", "Lost"];
export const LEAD_SOURCES = ["Website", "Referral", "LinkedIn", "Cold Call", "Event", "Advertisement", "Other"];

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function uid(prefix) {
  return prefix + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function formatISODate(d) {
  d = d instanceof Date ? d : new Date(d);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatTime(d) {
  d = d instanceof Date ? d : new Date(d);
  return [d.getHours(), d.getMinutes(), d.getSeconds()].map(n => String(n).padStart(2, "0")).join(":");
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

function defaultUsers() {
  return [
    { id: "usr_admin", username: "Admin", password: "Admin@123", role: "admin", name: "Admin User", email: "admin@leadflow.io", phone: "+1 (555) 100-0001", title: "System Administrator", department: "Operations", bio: "Full access administrator for LeadFlow CRM.", avatarColor: "#60A5FA", createdAt: "2024-01-01T08:00:00.000Z", lastLogin: null },
    { id: "usr_john", username: "John", password: "John@123", role: "user", name: "John Mitchell", email: "john@leadflow.io", phone: "+1 (555) 200-0002", title: "Sales Executive", department: "Sales", bio: "Focused on enterprise pipeline growth and client relationships.", avatarColor: "#34D399", createdAt: "2024-02-15T09:30:00.000Z", lastLogin: null },
    { id: "usr_sarah", username: "Sarah", password: "Sarah@123", role: "user", name: "Sarah Chen", email: "sarah@leadflow.io", phone: "+1 (555) 300-0003", title: "Account Manager", department: "Sales", bio: "Manages mid-market accounts and inbound lead qualification.", avatarColor: "#C084FC", createdAt: "2024-03-01T10:00:00.000Z", lastLogin: null },
  ];
}

function defaultCategories() {
  return [
    { id: "cat_tech", name: "Technology", color: "#60A5FA", description: "Software, IT services, and SaaS companies.", createdAt: "2024-01-01T08:00:00.000Z", leadCount: 0 },
    { id: "cat_health", name: "Healthcare", color: "#34D399", description: "Hospitals, clinics, and health-tech providers.", createdAt: "2024-01-01T08:00:00.000Z", leadCount: 0 },
    { id: "cat_finance", name: "Finance", color: "#FBBF24", description: "Banks, fintech, and financial advisory firms.", createdAt: "2024-01-01T08:00:00.000Z", leadCount: 0 },
    { id: "cat_retail", name: "Retail", color: "#F87171", description: "E-commerce and brick-and-mortar retail.", createdAt: "2024-01-01T08:00:00.000Z", leadCount: 0 },
    { id: "cat_edu", name: "Education", color: "#C084FC", description: "Schools, universities, and ed-tech platforms.", createdAt: "2024-01-01T08:00:00.000Z", leadCount: 0 },
    { id: "cat_other", name: "Other", color: "#9AA3B5", description: "Miscellaneous or uncategorized leads.", createdAt: "2024-01-01T08:00:00.000Z", leadCount: 0 },
  ];
}

function defaultSettings() {
  return { companyName: "LeadFlow CRM", timezone: "America/New_York", dateFormat: "MMM D, YYYY", leadsPerPage: 10, defaultLeadStatus: "New", defaultLeadSource: "Website", emailNotifications: true, desktopNotifications: false, autoBackup: false };
}

function sampleLeads() {
  const now = new Date();
  const today = formatISODate(now);
  return [
    { id: "LD-2024-00001", leadName: "Michael Torres", businessName: "NovaTech Solutions", email: "michael@novatech.io", phone: "+1 (555) 401-2200", website: "https://novatech.io", category: "Technology", customCategory: "", city: "San Francisco", state: "CA", country: "USA", address: "100 Market Street, Suite 400", description: "Interested in enterprise CRM integration for 200+ sales reps.", leadSource: "LinkedIn", leadStatus: "Qualified", addedDate: today, addedTime: "09:15:00", addedBy: "John", updatedAt: now.toISOString() },
    { id: "LD-2024-00002", leadName: "Emily Watson", businessName: "GreenLeaf Health", email: "emily@greenleaf.health", phone: "+1 (555) 402-3300", website: "https://greenleaf.health", category: "Healthcare", customCategory: "", city: "Boston", state: "MA", country: "USA", address: "45 Harbor View Blvd", description: "Looking for patient outreach automation tools.", leadSource: "Referral", leadStatus: "Contacted", addedDate: today, addedTime: "10:42:00", addedBy: "Sarah", updatedAt: now.toISOString() },
    { id: "LD-2024-00003", leadName: "David Kim", businessName: "Summit Finance Group", email: "david@summitfinance.com", phone: "+1 (555) 403-4400", website: "https://summitfinance.com", category: "Finance", customCategory: "", city: "New York", state: "NY", country: "USA", address: "200 Wall Street, Floor 18", description: "Evaluating lead scoring for wealth management division.", leadSource: "Website", leadStatus: "New", addedDate: today, addedTime: "11:08:00", addedBy: "Admin", updatedAt: now.toISOString() },
    { id: "LD-2024-00004", leadName: "Lisa Anderson", businessName: "Urban Style Retail", email: "lisa@urbanstyle.com", phone: "+1 (555) 404-5500", website: "https://urbanstyle.com", category: "Retail", customCategory: "", city: "Chicago", state: "IL", country: "USA", address: "88 Michigan Avenue", description: "Needs omnichannel lead capture for 40 store locations.", leadSource: "Event", leadStatus: "Proposal", addedDate: "2024-07-10", addedTime: "14:20:00", addedBy: "John", updatedAt: now.toISOString() },
    { id: "LD-2024-00005", leadName: "Robert Patel", businessName: "BrightPath Academy", email: "robert@brightpath.edu", phone: "+1 (555) 405-6600", website: "https://brightpath.edu", category: "Education", customCategory: "", city: "Austin", state: "TX", country: "USA", address: "12 University Drive", description: "Enrollment lead management for online programs.", leadSource: "Cold Call", leadStatus: "Negotiation", addedDate: "2024-07-08", addedTime: "16:55:00", addedBy: "Sarah", updatedAt: now.toISOString() },
  ];
}

function syncCategoryLeadCounts() {
  const leads = getLeads();
  const categories = getCategories().map(c => {
    c.leadCount = leads.filter(l => l.category === c.name || (c.name === "Other" && l.customCategory)).length;
    return c;
  });
  write(KEYS.CATEGORIES, categories);
}

export function bootstrap() {
  if (!read(KEYS.USERS)) write(KEYS.USERS, defaultUsers());
  if (!read(KEYS.CATEGORIES)) write(KEYS.CATEGORIES, defaultCategories());
  if (!read(KEYS.SETTINGS)) write(KEYS.SETTINGS, defaultSettings());
  if (!read(KEYS.LEADS)) {
    write(KEYS.LEADS, sampleLeads());
    write(KEYS.LEAD_SEQ, 6);
  }
  if (!read(KEYS.ACTIVITIES)) {
    write(KEYS.ACTIVITIES, [{ id: uid("act"), type: "system", message: "LeadFlow CRM initialized with sample data.", user: "System", timestamp: new Date().toISOString() }]);
  }
  syncCategoryLeadCounts();
}

export function logActivity(type, message, user) {
  const activities = getActivities();
  activities.unshift({ id: uid("act"), type, message, user: user || "System", timestamp: new Date().toISOString() });
  if (activities.length > 500) activities.length = 500;
  write(KEYS.ACTIVITIES, activities);
}

export function getUsers() { return read(KEYS.USERS, defaultUsers()); }
export function saveUsers(users) { write(KEYS.USERS, users); }

export function authenticate(username, password) {
  return getUsers().find(u => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password) || null;
}

export function getSession() { return read(KEYS.SESSION, null); }

export function setSession(user, remember) {
  const session = { userId: user.id, username: user.username, role: user.role, name: user.name, email: user.email, avatarColor: user.avatarColor, loggedInAt: new Date().toISOString(), remember: !!remember };
  write(KEYS.SESSION, session);
  const users = getUsers();
  const idx = users.findIndex(u => u.id === user.id);
  if (idx !== -1) { users[idx].lastLogin = session.loggedInAt; saveUsers(users); }
  logActivity("auth", `${user.username} signed in.`, user.username);
  return session;
}

export function clearSession() {
  const session = getSession();
  if (session) logActivity("auth", `${session.username} signed out.`, session.username);
  localStorage.removeItem(KEYS.SESSION);
}

export function isAdmin(session) { return session && session.role === "admin"; }

export function getCurrentUserRecord(session) {
  session = session || getSession();
  if (!session) return null;
  return getUsers().find(u => u.id === session.userId) || null;
}

export function updateUserProfile(userId, updates) {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...updates, updatedAt: new Date().toISOString() };
  saveUsers(users);
  const session = getSession();
  if (session && session.userId === userId) setSession(users[idx], session.remember);
  return users[idx];
}

export function getLeads() { return read(KEYS.LEADS, []); }
export function saveLeads(leads) { write(KEYS.LEADS, leads); syncCategoryLeadCounts(); }

export function generateLeadId() {
  const seq = read(KEYS.LEAD_SEQ, 1);
  const id = `LD-${new Date().getFullYear()}-${String(seq).padStart(5, "0")}`;
  write(KEYS.LEAD_SEQ, seq + 1);
  return id;
}

export function getLeadsForUser(session) {
  const leads = getLeads();
  if (isAdmin(session)) return leads;
  return leads.filter(l => l.addedBy === session.username);
}

export function addLead(data, session) {
  const now = new Date();
  const lead = { ...data, id: generateLeadId(), addedDate: formatISODate(now), addedTime: formatTime(now), addedBy: session.username, updatedAt: now.toISOString() };
  const leads = getLeads();
  leads.unshift(lead);
  saveLeads(leads);
  logActivity("lead", `Lead "${lead.leadName}" created (${lead.id}).`, session.username);
  return lead;
}

export function updateLead(id, data, session) {
  const leads = getLeads();
  const idx = leads.findIndex(l => l.id === id);
  if (idx === -1) return null;
  if (!isAdmin(session) && leads[idx].addedBy !== session.username) return null;
  leads[idx] = { ...leads[idx], ...data, updatedAt: new Date().toISOString() };
  saveLeads(leads);
  logActivity("lead", `Lead "${leads[idx].leadName}" updated.`, session.username);
  return leads[idx];
}

export function deleteLead(id, session) {
  const leads = getLeads();
  const lead = leads.find(l => l.id === id);
  if (!lead) return false;
  if (!isAdmin(session) && lead.addedBy !== session.username) return false;
  saveLeads(leads.filter(l => l.id !== id));
  logActivity("lead", `Lead "${lead.leadName}" deleted.`, session.username);
  return true;
}

export function getCategories() { return read(KEYS.CATEGORIES, defaultCategories()); }
export function saveCategories(categories) { write(KEYS.CATEGORIES, categories); }

export function addCategory(data, session) {
  const categories = getCategories();
  if (categories.some(c => c.name.toLowerCase() === data.name.toLowerCase())) return { error: "Category name already exists." };
  const cat = { id: uid("cat"), name: data.name.trim(), color: data.color || "#60A5FA", description: data.description || "", createdAt: new Date().toISOString(), leadCount: 0 };
  categories.push(cat);
  saveCategories(categories);
  logActivity("category", `Category "${cat.name}" created.`, session.username);
  return cat;
}

export function updateCategory(id, data, session) {
  const categories = getCategories();
  const idx = categories.findIndex(c => c.id === id);
  if (idx === -1) return null;
  const oldName = categories[idx].name;
  if (data.name && categories.some((c, i) => i !== idx && c.name.toLowerCase() === data.name.toLowerCase())) return { error: "Category name already exists." };
  categories[idx] = { ...categories[idx], ...data };
  saveCategories(categories);
  if (data.name && data.name !== oldName) {
    const leads = getLeads().map(l => { if (l.category === oldName) l.category = data.name; return l; });
    saveLeads(leads);
  }
  logActivity("category", `Category "${categories[idx].name}" updated.`, session.username);
  return categories[idx];
}

export function deleteCategory(id, session) {
  const categories = getCategories();
  const cat = categories.find(c => c.id === id);
  if (!cat) return { error: "Category not found." };
  if (cat.name === "Other") return { error: 'The "Other" category cannot be deleted.' };
  const leadsUsing = getLeads().filter(l => l.category === cat.name);
  if (leadsUsing.length > 0) return { error: `Cannot delete — ${leadsUsing.length} lead(s) use this category.` };
  saveCategories(categories.filter(c => c.id !== id));
  logActivity("category", `Category "${cat.name}" deleted.`, session.username);
  return true;
}

export function getActivities() { return read(KEYS.ACTIVITIES, []); }

export function getSettings() { return { ...defaultSettings(), ...read(KEYS.SETTINGS, {}) }; }
export function saveSettings(settings) { write(KEYS.SETTINGS, settings); }

export function exportAllData() {
  return { version: "1.0", exportedAt: new Date().toISOString(), users: getUsers().map(u => ({ ...u })), leads: getLeads(), categories: getCategories(), activities: getActivities(), settings: getSettings(), leadSeq: read(KEYS.LEAD_SEQ, 1) };
}

export function importAllData(payload, session) {
  if (!payload || !payload.leads || !payload.categories) return { error: "Invalid backup file format." };
  if (payload.users) write(KEYS.USERS, payload.users);
  write(KEYS.LEADS, payload.leads);
  write(KEYS.CATEGORIES, payload.categories);
  if (payload.activities) write(KEYS.ACTIVITIES, payload.activities);
  if (payload.settings) write(KEYS.SETTINGS, payload.settings);
  if (payload.leadSeq) write(KEYS.LEAD_SEQ, payload.leadSeq);
  syncCategoryLeadCounts();
  logActivity("system", "Data restored from backup.", session.username);
  return { success: true };
}

export function resetAllData(session) {
  Object.keys(KEYS).forEach(k => {
    if (KEYS[k] !== KEYS.THEME && KEYS[k] !== KEYS.SESSION) localStorage.removeItem(KEYS[k]);
  });
  bootstrap();
  logActivity("system", "All CRM data reset to defaults.", session ? session.username : "System");
}

export function categoryColor(name, categories) {
  categories = categories || getCategories();
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
