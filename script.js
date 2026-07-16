/**
 * LeadFlow CRM — Shared core module
 * LocalStorage data layer, auth, theme, activity log, and app shell helpers.
 */
(function (global) {
  "use strict";

  /* ─── Storage keys ─────────────────────────────────────────────── */
  var KEYS = {
    USERS: "leadflow_users",
    SESSION: "leadflow_session",
    LEADS: "leadflow_leads",
    CATEGORIES: "leadflow_categories",
    ACTIVITIES: "leadflow_activities",
    SETTINGS: "leadflow_settings",
    THEME: "leadflow_theme",
    LEAD_SEQ: "leadflow_lead_seq",
  };

  var LEAD_STATUSES = [
    "New",
    "Contacted",
    "Qualified",
    "Proposal",
    "Negotiation",
    "Won",
    "Lost",
  ];

  var LEAD_SOURCES = [
    "Website",
    "Referral",
    "LinkedIn",
    "Cold Call",
    "Event",
    "Advertisement",
    "Other",
  ];

  /* ─── Default seed data ────────────────────────────────────────── */
  function defaultUsers() {
    return [
      {
        id: "usr_admin",
        username: "Admin",
        password: "Admin@123",
        role: "admin",
        name: "Admin User",
        email: "admin@leadflow.io",
        phone: "+1 (555) 100-0001",
        title: "System Administrator",
        department: "Operations",
        bio: "Full access administrator for LeadFlow CRM.",
        avatarColor: "#60A5FA",
        createdAt: "2024-01-01T08:00:00.000Z",
        lastLogin: null,
      },
      {
        id: "usr_john",
        username: "John",
        password: "John@123",
        role: "user",
        name: "John Mitchell",
        email: "john@leadflow.io",
        phone: "+1 (555) 200-0002",
        title: "Sales Executive",
        department: "Sales",
        bio: "Focused on enterprise pipeline growth and client relationships.",
        avatarColor: "#34D399",
        createdAt: "2024-02-15T09:30:00.000Z",
        lastLogin: null,
      },
      {
        id: "usr_sarah",
        username: "Sarah",
        password: "Sarah@123",
        role: "user",
        name: "Sarah Chen",
        email: "sarah@leadflow.io",
        phone: "+1 (555) 300-0003",
        title: "Account Manager",
        department: "Sales",
        bio: "Manages mid-market accounts and inbound lead qualification.",
        avatarColor: "#C084FC",
        createdAt: "2024-03-01T10:00:00.000Z",
        lastLogin: null,
      },
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
    return {
      companyName: "LeadFlow CRM",
      timezone: "America/New_York",
      dateFormat: "MMM D, YYYY",
      leadsPerPage: 10,
      defaultLeadStatus: "New",
      defaultLeadSource: "Website",
      emailNotifications: true,
      desktopNotifications: false,
      autoBackup: false,
    };
  }

  function sampleLeads() {
    var now = new Date();
    var today = formatISODate(now);
    var time = formatTime(now);
    return [
      {
        id: "LD-2024-00001",
        leadName: "Michael Torres",
        businessName: "NovaTech Solutions",
        email: "michael@novatech.io",
        phone: "+1 (555) 401-2200",
        website: "https://novatech.io",
        category: "Technology",
        customCategory: "",
        city: "San Francisco",
        state: "CA",
        country: "USA",
        address: "100 Market Street, Suite 400",
        description: "Interested in enterprise CRM integration for 200+ sales reps.",
        leadSource: "LinkedIn",
        leadStatus: "Qualified",
        addedDate: today,
        addedTime: "09:15:00",
        addedBy: "John",
        updatedAt: now.toISOString(),
      },
      {
        id: "LD-2024-00002",
        leadName: "Emily Watson",
        businessName: "GreenLeaf Health",
        email: "emily@greenleaf.health",
        phone: "+1 (555) 402-3300",
        website: "https://greenleaf.health",
        category: "Healthcare",
        customCategory: "",
        city: "Boston",
        state: "MA",
        country: "USA",
        address: "45 Harbor View Blvd",
        description: "Looking for patient outreach automation tools.",
        leadSource: "Referral",
        leadStatus: "Contacted",
        addedDate: today,
        addedTime: "10:42:00",
        addedBy: "Sarah",
        updatedAt: now.toISOString(),
      },
      {
        id: "LD-2024-00003",
        leadName: "David Kim",
        businessName: "Summit Finance Group",
        email: "david@summitfinance.com",
        phone: "+1 (555) 403-4400",
        website: "https://summitfinance.com",
        category: "Finance",
        customCategory: "",
        city: "New York",
        state: "NY",
        country: "USA",
        address: "200 Wall Street, Floor 18",
        description: "Evaluating lead scoring for wealth management division.",
        leadSource: "Website",
        leadStatus: "New",
        addedDate: today,
        addedTime: "11:08:00",
        addedBy: "Admin",
        updatedAt: now.toISOString(),
      },
      {
        id: "LD-2024-00004",
        leadName: "Lisa Anderson",
        businessName: "Urban Style Retail",
        email: "lisa@urbanstyle.com",
        phone: "+1 (555) 404-5500",
        website: "https://urbanstyle.com",
        category: "Retail",
        customCategory: "",
        city: "Chicago",
        state: "IL",
        country: "USA",
        address: "88 Michigan Avenue",
        description: "Needs omnichannel lead capture for 40 store locations.",
        leadSource: "Event",
        leadStatus: "Proposal",
        addedDate: "2024-07-10",
        addedTime: "14:20:00",
        addedBy: "John",
        updatedAt: now.toISOString(),
      },
      {
        id: "LD-2024-00005",
        leadName: "Robert Patel",
        businessName: "BrightPath Academy",
        email: "robert@brightpath.edu",
        phone: "+1 (555) 405-6600",
        website: "https://brightpath.edu",
        category: "Education",
        customCategory: "",
        city: "Austin",
        state: "TX",
        country: "USA",
        address: "12 University Drive",
        description: "Enrollment lead management for online programs.",
        leadSource: "Cold Call",
        leadStatus: "Negotiation",
        addedDate: "2024-07-08",
        addedTime: "16:55:00",
        addedBy: "Sarah",
        updatedAt: now.toISOString(),
      },
    ];
  }

  /* ─── Low-level storage helpers ────────────────────────────────── */
  function read(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function uid(prefix) {
    return prefix + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  /* ─── Bootstrap / init ─────────────────────────────────────────── */
  function bootstrap() {
    if (!read(KEYS.USERS)) write(KEYS.USERS, defaultUsers());
    if (!read(KEYS.CATEGORIES)) write(KEYS.CATEGORIES, defaultCategories());
    if (!read(KEYS.SETTINGS)) write(KEYS.SETTINGS, defaultSettings());
    if (!read(KEYS.LEADS)) {
      write(KEYS.LEADS, sampleLeads());
      write(KEYS.LEAD_SEQ, 6);
    }
    if (!read(KEYS.ACTIVITIES)) {
      write(KEYS.ACTIVITIES, [
        {
          id: uid("act"),
          type: "system",
          message: "LeadFlow CRM initialized with sample data.",
          user: "System",
          timestamp: new Date().toISOString(),
        },
      ]);
    }
    syncCategoryLeadCounts();
  }

  function syncCategoryLeadCounts() {
    var leads = getLeads();
    var categories = getCategories().map(function (c) {
      c.leadCount = leads.filter(function (l) {
        return l.category === c.name || (c.name === "Other" && l.customCategory);
      }).length;
      return c;
    });
    write(KEYS.CATEGORIES, categories);
  }

  /* ─── Auth ─────────────────────────────────────────────────────── */
  function getUsers() {
    return read(KEYS.USERS, defaultUsers());
  }

  function saveUsers(users) {
    write(KEYS.USERS, users);
  }

  function authenticate(username, password) {
    var users = getUsers();
    var user = users.find(function (u) {
      return u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password;
    });
    return user || null;
  }

  function getSession() {
    return read(KEYS.SESSION, null);
  }

  function setSession(user, remember) {
    var session = {
      userId: user.id,
      username: user.username,
      role: user.role,
      name: user.name,
      email: user.email,
      avatarColor: user.avatarColor,
      loggedInAt: new Date().toISOString(),
      remember: !!remember,
    };
    write(KEYS.SESSION, session);

    var users = getUsers();
    var idx = users.findIndex(function (u) { return u.id === user.id; });
    if (idx !== -1) {
      users[idx].lastLogin = session.loggedInAt;
      saveUsers(users);
    }

    logActivity("auth", user.username + " signed in.", user.username);
    return session;
  }

  function clearSession() {
    var session = getSession();
    if (session) logActivity("auth", session.username + " signed out.", session.username);
    localStorage.removeItem(KEYS.SESSION);
  }

  function requireAuth(redirectTo) {
    bootstrap();
    applyTheme();
    var session = getSession();
    if (!session) {
      window.location.href = redirectTo || "index.html";
      return null;
    }
    return session;
  }

  function isAdmin(session) {
    return session && session.role === "admin";
  }

  function getCurrentUserRecord(session) {
    session = session || getSession();
    if (!session) return null;
    return getUsers().find(function (u) { return u.id === session.userId; }) || null;
  }

  function updateUserProfile(userId, updates) {
    var users = getUsers();
    var idx = users.findIndex(function (u) { return u.id === userId; });
    if (idx === -1) return null;
    users[idx] = Object.assign({}, users[idx], updates, { updatedAt: new Date().toISOString() });
    saveUsers(users);
    var session = getSession();
    if (session && session.userId === userId) {
      setSession(users[idx], session.remember);
    }
    return users[idx];
  }

  /* ─── Leads ────────────────────────────────────────────────────── */
  function getLeads() {
    return read(KEYS.LEADS, []);
  }

  function saveLeads(leads) {
    write(KEYS.LEADS, leads);
    syncCategoryLeadCounts();
  }

  function generateLeadId() {
    var seq = read(KEYS.LEAD_SEQ, 1);
    var year = new Date().getFullYear();
    var id = "LD-" + year + "-" + String(seq).padStart(5, "0");
    write(KEYS.LEAD_SEQ, seq + 1);
    return id;
  }

  function getLeadsForUser(session) {
    var leads = getLeads();
    if (isAdmin(session)) return leads;
    return leads.filter(function (l) { return l.addedBy === session.username; });
  }

  function addLead(data, session) {
    var now = new Date();
    var lead = Object.assign({}, data, {
      id: generateLeadId(),
      addedDate: formatISODate(now),
      addedTime: formatTime(now),
      addedBy: session.username,
      updatedAt: now.toISOString(),
    });
    var leads = getLeads();
    leads.unshift(lead);
    saveLeads(leads);
    logActivity("lead", "Lead \"" + lead.leadName + "\" created (" + lead.id + ").", session.username);
    return lead;
  }

  function updateLead(id, data, session) {
    var leads = getLeads();
    var idx = leads.findIndex(function (l) { return l.id === id; });
    if (idx === -1) return null;
    if (!isAdmin(session) && leads[idx].addedBy !== session.username) return null;
    leads[idx] = Object.assign({}, leads[idx], data, { updatedAt: new Date().toISOString() });
    saveLeads(leads);
    logActivity("lead", "Lead \"" + leads[idx].leadName + "\" updated.", session.username);
    return leads[idx];
  }

  function deleteLead(id, session) {
    var leads = getLeads();
    var lead = leads.find(function (l) { return l.id === id; });
    if (!lead) return false;
    if (!isAdmin(session) && lead.addedBy !== session.username) return false;
    saveLeads(leads.filter(function (l) { return l.id !== id; }));
    logActivity("lead", "Lead \"" + lead.leadName + "\" deleted.", session.username);
    return true;
  }

  /* ─── Categories ───────────────────────────────────────────────── */
  function getCategories() {
    return read(KEYS.CATEGORIES, defaultCategories());
  }

  function saveCategories(categories) {
    write(KEYS.CATEGORIES, categories);
  }

  function addCategory(data, session) {
    var categories = getCategories();
    if (categories.some(function (c) { return c.name.toLowerCase() === data.name.toLowerCase(); })) {
      return { error: "Category name already exists." };
    }
    var cat = {
      id: uid("cat"),
      name: data.name.trim(),
      color: data.color || "#60A5FA",
      description: data.description || "",
      createdAt: new Date().toISOString(),
      leadCount: 0,
    };
    categories.push(cat);
    saveCategories(categories);
    logActivity("category", "Category \"" + cat.name + "\" created.", session.username);
    return cat;
  }

  function updateCategory(id, data, session) {
    var categories = getCategories();
    var idx = categories.findIndex(function (c) { return c.id === id; });
    if (idx === -1) return null;
    var oldName = categories[idx].name;
    if (data.name && categories.some(function (c, i) {
      return i !== idx && c.name.toLowerCase() === data.name.toLowerCase();
    })) {
      return { error: "Category name already exists." };
    }
    categories[idx] = Object.assign({}, categories[idx], data);
    saveCategories(categories);
    if (data.name && data.name !== oldName) {
      var leads = getLeads().map(function (l) {
        if (l.category === oldName) l.category = data.name;
        return l;
      });
      saveLeads(leads);
    }
    logActivity("category", "Category \"" + categories[idx].name + "\" updated.", session.username);
    return categories[idx];
  }

  function deleteCategory(id, session) {
    var categories = getCategories();
    var cat = categories.find(function (c) { return c.id === id; });
    if (!cat) return { error: "Category not found." };
    if (cat.name === "Other") return { error: "The \"Other\" category cannot be deleted." };
    var leadsUsing = getLeads().filter(function (l) { return l.category === cat.name; });
    if (leadsUsing.length > 0) {
      return { error: "Cannot delete — " + leadsUsing.length + " lead(s) use this category." };
    }
    saveCategories(categories.filter(function (c) { return c.id !== id; }));
    logActivity("category", "Category \"" + cat.name + "\" deleted.", session.username);
    return true;
  }

  /* ─── Activities ───────────────────────────────────────────────── */
  function getActivities() {
    return read(KEYS.ACTIVITIES, []);
  }

  function logActivity(type, message, user) {
    var activities = getActivities();
    activities.unshift({
      id: uid("act"),
      type: type,
      message: message,
      user: user || "System",
      timestamp: new Date().toISOString(),
    });
    if (activities.length > 500) activities = activities.slice(0, 500);
    write(KEYS.ACTIVITIES, activities);
  }

  /* ─── Settings ─────────────────────────────────────────────────── */
  function getSettings() {
    return Object.assign({}, defaultSettings(), read(KEYS.SETTINGS, {}));
  }

  function saveSettings(settings) {
    write(KEYS.SETTINGS, settings);
  }

  function exportAllData() {
    return {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      users: getUsers().map(function (u) {
        var copy = Object.assign({}, u);
        return copy;
      }),
      leads: getLeads(),
      categories: getCategories(),
      activities: getActivities(),
      settings: getSettings(),
      leadSeq: read(KEYS.LEAD_SEQ, 1),
    };
  }

  function importAllData(payload, session) {
    if (!payload || !payload.leads || !payload.categories) {
      return { error: "Invalid backup file format." };
    }
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

  function resetAllData(session) {
    Object.keys(KEYS).forEach(function (k) {
      if (KEYS[k] !== KEYS.THEME && KEYS[k] !== KEYS.SESSION) {
        localStorage.removeItem(KEYS[k]);
      }
    });
    bootstrap();
    logActivity("system", "All CRM data reset to defaults.", session ? session.username : "System");
  }

  /* ─── Theme ────────────────────────────────────────────────────── */
  function getTheme() {
    return localStorage.getItem(KEYS.THEME) || "light";
  }

  function setTheme(theme) {
    localStorage.setItem(KEYS.THEME, theme);
    applyTheme();
  }

  function applyTheme() {
    var theme = getTheme();
    if (theme === "light") {
      document.body.classList.add("light");
    } else {
      document.body.classList.remove("light");
    }
    var icon = document.getElementById("themeToggleIcon");
    if (icon) {
      icon.className = theme === "light" ? "fa-solid fa-moon" : "fa-solid fa-sun";
    }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === "light" ? "#EEF1F6" : "#0F1117";
  }

  function toggleTheme() {
    setTheme(getTheme() === "light" ? "dark" : "light");
  }

  /* ─── Formatting utilities ─────────────────────────────────────── */
  function formatISODate(d) {
    d = d instanceof Date ? d : new Date(d);
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + day;
  }

  function formatTime(d) {
    d = d instanceof Date ? d : new Date(d);
    return [d.getHours(), d.getMinutes(), d.getSeconds()]
      .map(function (n) { return String(n).padStart(2, "0"); })
      .join(":");
  }

  function formatDisplayDate(iso) {
    if (!iso) return "—";
    var d = new Date(iso);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }

  function formatDisplayDateTime(iso) {
    if (!iso) return "—";
    var d = new Date(iso);
    return d.toLocaleString("en-US", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  function escapeHtml(str) {
    if (str == null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    return Promise.resolve();
  }

  /* ─── Toast notifications ──────────────────────────────────────── */
  function showToast(message, type) {
    type = type || "info";
    var container = document.getElementById("toastContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "toastContainer";
      container.className = "toast-container";
      container.setAttribute("aria-live", "polite");
      document.body.appendChild(container);
    }
    var icons = { success: "fa-circle-check", error: "fa-circle-xmark", warning: "fa-triangle-exclamation", info: "fa-circle-info" };
    var toast = document.createElement("div");
    toast.className = "toast toast--" + type;
    toast.innerHTML =
      '<i class="fa-solid ' + (icons[type] || icons.info) + '" aria-hidden="true"></i>' +
      "<span>" + escapeHtml(message) + "</span>" +
      '<button type="button" class="toast__close" aria-label="Dismiss"><i class="fa-solid fa-xmark"></i></button>';
    container.appendChild(toast);
    requestAnimationFrame(function () { toast.classList.add("toast--visible"); });
    var close = function () {
      toast.classList.remove("toast--visible");
      setTimeout(function () { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 300);
    };
    toast.querySelector(".toast__close").addEventListener("click", close);
    setTimeout(close, 4000);
  }

  /* ─── Animated counter ───────────────────────────────────────────── */
  function animateCounter(el, target, duration) {
    duration = duration || 1200;
    var start = 0;
    var startTime = null;
    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(start + (target - start) * eased).toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString();
    }
    requestAnimationFrame(step);
  }

  /* ─── Status / category badge helpers ──────────────────────────── */
  function statusBadgeClass(status) {
    var map = {
      New: "badge--info",
      Contacted: "badge--purple",
      Qualified: "badge--accent",
      Proposal: "badge--warning",
      Negotiation: "badge--warning",
      Won: "badge--success",
      Lost: "badge--danger",
    };
    return map[status] || "badge--neutral";
  }

  function categoryColor(name, categories) {
    categories = categories || getCategories();
    var cat = categories.find(function (c) { return c.name === name; });
    return cat ? cat.color : "#9AA3B5";
  }

  /* ─── App shell: sidebar + navbar ──────────────────────────────── */
  function initAppShell(activePage) {
    var session = requireAuth();
    if (!session) return null;

    var sidebar = document.getElementById("sidebar");
    if (sidebar) {
      var navItems = [
        { href: "dashboard.html", icon: "fa-gauge-high", label: "Dashboard", page: "dashboard" },
        { href: "categories.html", icon: "fa-tags", label: "Categories", page: "categories" },
        { href: "users.html", icon: "fa-users", label: "Users", page: "users", adminOnly: true },
        { href: "settings.html", icon: "fa-gear", label: "Settings", page: "settings" },
        { href: "profile.html", icon: "fa-user", label: "Profile", page: "profile" },
      ];
      var navHtml = navItems
        .filter(function (item) { return !item.adminOnly || isAdmin(session); })
        .map(function (item) {
          var active = item.page === activePage ? " sidebar-nav__link--active" : "";
          return (
            '<a href="' + item.href + '" class="sidebar-nav__link' + active + '" data-page="' + item.page + '">' +
            '<i class="fa-solid ' + item.icon + '" aria-hidden="true"></i>' +
            "<span>" + item.label + "</span></a>"
          );
        })
        .join("");
      var sidebarNav = sidebar.querySelector(".sidebar-nav");
      if (sidebarNav) sidebarNav.innerHTML = navHtml;
    }

    var avatarEl = document.getElementById("navAvatar");
    if (avatarEl) {
      avatarEl.textContent = session.username.charAt(0).toUpperCase();
      avatarEl.style.background = session.avatarColor || "var(--accent)";
    }
    var navUserName = document.getElementById("navUserName");
    if (navUserName) navUserName.textContent = session.name || session.username;
    var navUserRole = document.getElementById("navUserRole");
    if (navUserRole) navUserRole.textContent = isAdmin(session) ? "Administrator" : "Team Member";

    var dropdownAvatar = document.getElementById("dropdownAvatar");
    if (dropdownAvatar) {
      dropdownAvatar.textContent = session.username.charAt(0).toUpperCase();
      dropdownAvatar.style.background = session.avatarColor || "var(--accent)";
    }
    var dropdownName = document.getElementById("dropdownName");
    if (dropdownName) dropdownName.textContent = session.name || session.username;
    var dropdownEmail = document.getElementById("dropdownEmail");
    if (dropdownEmail) dropdownEmail.textContent = session.email || "";

    bindShellEvents(session);
    return session;
  }

  function bindShellEvents(session) {
    var themeBtn = document.getElementById("themeToggle");
    if (themeBtn) themeBtn.addEventListener("click", toggleTheme);

    var logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", function () {
        clearSession();
        window.location.href = "index.html";
      });
    }

    var userMenuBtn = document.getElementById("userMenuBtn");
    var userDropdown = document.getElementById("userDropdown");
    if (userMenuBtn && userDropdown) {
      userMenuBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        userDropdown.classList.toggle("user-dropdown--open");
        userMenuBtn.setAttribute("aria-expanded", userDropdown.classList.contains("user-dropdown--open"));
      });
      document.addEventListener("click", function () {
        userDropdown.classList.remove("user-dropdown--open");
        userMenuBtn.setAttribute("aria-expanded", "false");
      });
    }

    var sidebarToggle = document.getElementById("sidebarToggle");
    var sidebarOverlay = document.getElementById("sidebarOverlay");
    if (sidebarToggle) {
      sidebarToggle.addEventListener("click", function () {
        document.body.classList.toggle("sidebar-open");
      });
    }
    if (sidebarOverlay) {
      sidebarOverlay.addEventListener("click", function () {
        document.body.classList.remove("sidebar-open");
      });
    }

    var globalSearch = document.getElementById("globalSearch");
    if (globalSearch && activePageIs("dashboard")) {
      globalSearch.addEventListener("input", function () {
        var tableSearch = document.getElementById("tableSearch");
        if (tableSearch) {
          tableSearch.value = globalSearch.value;
          tableSearch.dispatchEvent(new Event("input"));
        }
      });
    }
  }

  function activePageIs(page) {
    return document.body.getAttribute("data-page") === page;
  }

  /* ─── CSV helpers ──────────────────────────────────────────────── */
  function leadsToCSV(leads) {
    var headers = [
      "ID", "Lead Name", "Business Name", "Email", "Phone", "Website",
      "Category", "Custom Category", "City", "State", "Country", "Address",
      "Description", "Lead Source", "Lead Status", "Added Date", "Added Time", "Added By",
    ];
    var rows = leads.map(function (l) {
      return [
        l.id, l.leadName, l.businessName, l.email, l.phone, l.website,
        l.category, l.customCategory, l.city, l.state, l.country, l.address,
        l.description, l.leadSource, l.leadStatus, l.addedDate, l.addedTime, l.addedBy,
      ].map(function (v) {
        v = v == null ? "" : String(v);
        if (v.indexOf(",") !== -1 || v.indexOf('"') !== -1 || v.indexOf("\n") !== -1) {
          return '"' + v.replace(/"/g, '""') + '"';
        }
        return v;
      }).join(",");
    });
    return headers.join(",") + "\n" + rows.join("\n");
  }

  function parseCSV(text) {
    var lines = text.split(/\r?\n/).filter(function (l) { return l.trim(); });
    if (lines.length < 2) return [];
    var headers = parseCSVLine(lines[0]);
    var leads = [];
    for (var i = 1; i < lines.length; i++) {
      var vals = parseCSVLine(lines[i]);
      if (vals.length < 2) continue;
      var obj = {};
      headers.forEach(function (h, idx) {
        var key = h.trim().toLowerCase().replace(/\s+/g, "");
        obj[key] = vals[idx] || "";
      });
      leads.push({
        leadName: obj.leadname || obj.name || "",
        businessName: obj.businessname || "",
        email: obj.email || "",
        phone: obj.phone || "",
        website: obj.website || "",
        category: obj.category || "Other",
        customCategory: obj.customcategory || "",
        city: obj.city || "",
        state: obj.state || "",
        country: obj.country || "",
        address: obj.address || "",
        description: obj.description || "",
        leadSource: obj.leadsource || "Website",
        leadStatus: obj.leadstatus || "New",
      });
    }
    return leads;
  }

  function parseCSVLine(line) {
    var result = [];
    var current = "";
    var inQuotes = false;
    for (var i = 0; i < line.length; i++) {
      var ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        result.push(current); current = "";
      } else current += ch;
    }
    result.push(current);
    return result;
  }

  function downloadFile(content, filename, mime) {
    var blob = new Blob([content], { type: mime });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  /* ─── Modal helpers ────────────────────────────────────────────── */
  function openModal(id) {
    var modal = document.getElementById(id);
    if (modal) {
      modal.classList.add("modal--open");
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-active");
    }
  }

  function closeModal(id) {
    var modal = document.getElementById(id);
    if (modal) {
      modal.classList.remove("modal--open");
      modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-active");
    }
  }

  function bindModalClosers() {
    document.querySelectorAll("[data-modal-close]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        closeModal(btn.getAttribute("data-modal-close"));
      });
    });
    document.querySelectorAll(".modal__backdrop").forEach(function (backdrop) {
      backdrop.addEventListener("click", function () {
        var modal = backdrop.closest(".modal");
        if (modal) closeModal(modal.id);
      });
    });
  }

  /* ─── Public API ───────────────────────────────────────────────── */
  var LeadFlow = {
    KEYS: KEYS,
    LEAD_STATUSES: LEAD_STATUSES,
    LEAD_SOURCES: LEAD_SOURCES,
    bootstrap: bootstrap,
    getUsers: getUsers,
    saveUsers: saveUsers,
    authenticate: authenticate,
    getSession: getSession,
    setSession: setSession,
    clearSession: clearSession,
    requireAuth: requireAuth,
    isAdmin: isAdmin,
    getCurrentUserRecord: getCurrentUserRecord,
    updateUserProfile: updateUserProfile,
    getLeads: getLeads,
    saveLeads: saveLeads,
    getLeadsForUser: getLeadsForUser,
    addLead: addLead,
    updateLead: updateLead,
    deleteLead: deleteLead,
    generateLeadId: generateLeadId,
    getCategories: getCategories,
    saveCategories: saveCategories,
    addCategory: addCategory,
    updateCategory: updateCategory,
    deleteCategory: deleteCategory,
    getActivities: getActivities,
    logActivity: logActivity,
    getSettings: getSettings,
    saveSettings: saveSettings,
    exportAllData: exportAllData,
    importAllData: importAllData,
    resetAllData: resetAllData,
    getTheme: getTheme,
    setTheme: setTheme,
    applyTheme: applyTheme,
    toggleTheme: toggleTheme,
    formatISODate: formatISODate,
    formatTime: formatTime,
    formatDisplayDate: formatDisplayDate,
    formatDisplayDateTime: formatDisplayDateTime,
    escapeHtml: escapeHtml,
    copyToClipboard: copyToClipboard,
    showToast: showToast,
    animateCounter: animateCounter,
    statusBadgeClass: statusBadgeClass,
    categoryColor: categoryColor,
    initAppShell: initAppShell,
    leadsToCSV: leadsToCSV,
    parseCSV: parseCSV,
    downloadFile: downloadFile,
    openModal: openModal,
    closeModal: closeModal,
    bindModalClosers: bindModalClosers,
    uid: uid,
  };

  bootstrap();
  global.LeadFlow = LeadFlow;

  /* Apply saved theme as early as possible */
  if (document.body) applyTheme();
})(window);
