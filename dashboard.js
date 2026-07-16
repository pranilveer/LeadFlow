/**
 * LeadFlow CRM — Dashboard page logic
 * Stats, lead form, data grid, import/export, print.
 */
(function () {
  "use strict";

  var LF = window.LeadFlow;
  var session = LF.initAppShell("dashboard");
  if (!session) return;

  /* ─── State ────────────────────────────────────────────────────── */
  var state = {
    sortKey: "addedDate",
    sortDir: "desc",
    page: 1,
    pageSize: 10,
    viewLeadId: null,
    deleteLeadId: null,
    importRows: [],
  };

  /* ─── DOM refs ─────────────────────────────────────────────────── */
  var leadFormSection = document.getElementById("leadFormSection");
  var leadFormToggle = document.getElementById("leadFormToggle");
  var leadForm = document.getElementById("leadForm");
  var leadEditId = document.getElementById("leadEditId");
  var categorySelect = document.getElementById("category");
  var customCategoryField = document.getElementById("customCategoryField");
  var leadSourceSelect = document.getElementById("leadSource");
  var leadStatusSelect = document.getElementById("leadStatus");
  var tableSearch = document.getElementById("tableSearch");
  var filterStatus = document.getElementById("filterStatus");
  var filterCategory = document.getElementById("filterCategory");
  var filterOwner = document.getElementById("filterOwner");
  var pageSizeSelect = document.getElementById("pageSize");
  var leadsTableBody = document.getElementById("leadsTableBody");
  var paginationInfo = document.getElementById("paginationInfo");
  var paginationControls = document.getElementById("paginationControls");

  /* ─── Init ─────────────────────────────────────────────────────── */
  function init() {
    populateSelects();
    bindEvents();
    LF.bindModalClosers();
    renderStats();
    renderTable();
  }

  function populateSelects() {
    var categories = LF.getCategories();
    categorySelect.innerHTML = categories.map(function (c) {
      return '<option value="' + LF.escapeHtml(c.name) + '">' + LF.escapeHtml(c.name) + "</option>";
    }).join("");

    leadSourceSelect.innerHTML = LF.LEAD_SOURCES.map(function (s) {
      return '<option value="' + s + '">' + s + "</option>";
    }).join("");

    leadStatusSelect.innerHTML = LF.LEAD_STATUSES.map(function (s) {
      return '<option value="' + s + '">' + s + "</option>";
    }).join("");

    filterStatus.innerHTML = '<option value="">All Statuses</option>' +
      LF.LEAD_STATUSES.map(function (s) { return '<option value="' + s + '">' + s + "</option>"; }).join("");

    filterCategory.innerHTML = '<option value="">All Categories</option>' +
      categories.map(function (c) { return '<option value="' + LF.escapeHtml(c.name) + '">' + LF.escapeHtml(c.name) + "</option>"; }).join("");

    var owners = getUniqueOwners();
    filterOwner.innerHTML = '<option value="">All Owners</option>' +
      owners.map(function (o) { return '<option value="' + LF.escapeHtml(o) + '">' + LF.escapeHtml(o) + "</option>"; }).join("");

    var settings = LF.getSettings();
    pageSizeSelect.value = String(settings.leadsPerPage || 10);
    state.pageSize = parseInt(pageSizeSelect.value, 10);
    leadStatusSelect.value = settings.defaultLeadStatus || "New";
    leadSourceSelect.value = settings.defaultLeadSource || "Website";
  }

  function getUniqueOwners() {
    var leads = LF.getLeadsForUser(session);
    var set = {};
    leads.forEach(function (l) { set[l.addedBy] = true; });
    return Object.keys(set).sort();
  }

  /* ─── Stats ────────────────────────────────────────────────────── */
  function renderStats() {
    var allLeads = LF.getLeadsForUser(session);
    var today = LF.formatISODate(new Date());
    var todayCount = allLeads.filter(function (l) { return l.addedDate === today; }).length;
    var myCount = allLeads.filter(function (l) { return l.addedBy === session.username; }).length;
    var catCount = LF.getCategories().length;

    LF.animateCounter(document.getElementById("statTotalLeads"), allLeads.length);
    LF.animateCounter(document.getElementById("statTodayLeads"), todayCount);
    LF.animateCounter(document.getElementById("statCategories"), catCount);
    LF.animateCounter(document.getElementById("statMyLeads"), myCount);
  }

  /* ─── Filtered & sorted data ───────────────────────────────────── */
  function getFilteredLeads() {
    var leads = LF.getLeadsForUser(session);
    var q = (tableSearch.value || "").toLowerCase().trim();
    var statusF = filterStatus.value;
    var catF = filterCategory.value;
    var ownerF = filterOwner.value;

    return leads.filter(function (l) {
      if (statusF && l.leadStatus !== statusF) return false;
      if (catF && l.category !== catF) return false;
      if (ownerF && l.addedBy !== ownerF) return false;
      if (!q) return true;
      var hay = [
        l.id, l.leadName, l.businessName, l.email, l.phone,
        l.category, l.customCategory, l.city, l.leadStatus, l.leadSource, l.addedBy,
      ].join(" ").toLowerCase();
      return hay.indexOf(q) !== -1;
    }).sort(function (a, b) {
      var av = a[state.sortKey] || "";
      var bv = b[state.sortKey] || "";
      if (av < bv) return state.sortDir === "asc" ? -1 : 1;
      if (av > bv) return state.sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }

  /* ─── Table render ───────────────────────────────────────────────── */
  function renderTable() {
    var filtered = getFilteredLeads();
    var total = filtered.length;
    var totalPages = Math.max(1, Math.ceil(total / state.pageSize));
    if (state.page > totalPages) state.page = totalPages;

    var start = (state.page - 1) * state.pageSize;
    var page = filtered.slice(start, start + state.pageSize);
    var categories = LF.getCategories();

    if (page.length === 0) {
      leadsTableBody.innerHTML =
        '<tr><td colspan="11" class="table-empty">' +
        '<i class="fa-solid fa-inbox"></i>No leads found. Add a lead or adjust your filters.</td></tr>';
    } else {
      leadsTableBody.innerHTML = page.map(function (l) {
        var catColor = LF.categoryColor(l.category, categories);
        var websiteCell = l.website
          ? '<a href="' + LF.escapeHtml(l.website) + '" target="_blank" rel="noopener">' + LF.escapeHtml(l.website) + '</a>'
          : "—";
        return (
          "<tr data-id=\"" + LF.escapeHtml(l.id) + "\">" +
          '<td class="cell-mono">' + LF.escapeHtml(l.id) + "</td>" +
          '<td class="cell-primary">' + LF.escapeHtml(l.leadName) + "</td>" +
          "<td>" + LF.escapeHtml(l.businessName) + "</td>" +
          '<td><button type="button" class="copy-btn" data-copy="' + LF.escapeHtml(l.email) + '" title="Copy email">' +
          LF.escapeHtml(l.email) + ' <i class="fa-regular fa-copy"></i></button></td>' +
          '<td>' + (l.phone
            ? '<button type="button" class="copy-btn" data-copy="' + LF.escapeHtml(l.phone) + '" title="Copy phone">' +
              LF.escapeHtml(l.phone) + ' <i class="fa-regular fa-copy"></i></button>'
            : "—") + "</td>" +
          '<td><span class="category-badge" style="background:' + catColor + '18;color:' + catColor + ';border-color:' + catColor + '30">' +
          '<span class="category-badge__dot" style="background:' + catColor + '"></span>' +
          LF.escapeHtml(l.category === "Other" && l.customCategory ? l.customCategory : l.category) + "</span></td>" +
          '<td><span class="badge ' + LF.statusBadgeClass(l.leadStatus) + '">' + LF.escapeHtml(l.leadStatus) + "</span></td>" +
          "<td>" + LF.escapeHtml(l.leadSource) + "</td>" +
          "<td>" + LF.escapeHtml(l.addedBy) + "</td>" +
          "<td>" + LF.escapeHtml(l.addedDate) + "</td>" +
          '<td><div class="table-actions">' +
          '<button type="button" class="btn btn--ghost btn--sm" data-action="view" data-id="' + LF.escapeHtml(l.id) + '" title="View"><i class="fa-solid fa-eye"></i></button>' +
          '<button type="button" class="btn btn--ghost btn--sm" data-action="edit" data-id="' + LF.escapeHtml(l.id) + '" title="Edit"><i class="fa-solid fa-pen"></i></button>' +
          '<button type="button" class="btn btn--ghost btn--sm" data-action="delete" data-id="' + LF.escapeHtml(l.id) + '" title="Delete" style="color:var(--red)"><i class="fa-solid fa-trash"></i></button>' +
          "</div></td></tr>"
        );
      }).join("");
    }

    paginationInfo.textContent = "Showing " + (total === 0 ? 0 : start + 1) + "–" + Math.min(start + state.pageSize, total) + " of " + total;
    renderPagination(totalPages);

    document.querySelectorAll("#leadsTable th[data-sort]").forEach(function (th) {
      th.classList.toggle("sorted", th.getAttribute("data-sort") === state.sortKey);
      var icon = th.querySelector(".sort-icon");
      if (icon) {
        icon.className = "fa-solid sort-icon " +
          (th.getAttribute("data-sort") === state.sortKey
            ? (state.sortDir === "asc" ? "fa-sort-up" : "fa-sort-down")
            : "fa-sort");
      }
    });
  }

  function renderPagination(totalPages) {
    var html = "";
    html += '<button type="button" class="pagination__btn" data-page="prev"' + (state.page <= 1 ? " disabled" : "") + '><i class="fa-solid fa-chevron-left"></i></button>';
    for (var i = 1; i <= totalPages; i++) {
      if (totalPages > 7 && i > 3 && i < totalPages - 2 && Math.abs(i - state.page) > 1) {
        if (i === 4 || i === totalPages - 3) html += '<span style="padding:0 0.25rem">…</span>';
        continue;
      }
      html += '<button type="button" class="pagination__btn' + (i === state.page ? " pagination__btn--active" : "") + '" data-page="' + i + '">' + i + "</button>";
    }
    html += '<button type="button" class="pagination__btn" data-page="next"' + (state.page >= totalPages ? " disabled" : "") + '><i class="fa-solid fa-chevron-right"></i></button>';
    paginationControls.innerHTML = html;
  }

  /* ─── Lead form ──────────────────────────────────────────────────── */
  function openLeadForm(editLead) {
    leadFormSection.classList.add("collapsible--open");
    leadFormToggle.setAttribute("aria-expanded", "true");
    leadFormSection.scrollIntoView({ behavior: "smooth", block: "start" });

    if (editLead) {
      document.getElementById("leadFormTitle").textContent = "Edit Lead";
      document.getElementById("leadFormSubmitLabel").textContent = "Update Lead";
      document.getElementById("leadFormCancel").hidden = false;
      document.getElementById("autoFields").hidden = false;
      leadEditId.value = editLead.id;
      document.getElementById("leadName").value = editLead.leadName;
      document.getElementById("businessName").value = editLead.businessName;
      document.getElementById("email").value = editLead.email;
      document.getElementById("phone").value = editLead.phone || "";
      document.getElementById("website").value = editLead.website || "";
      categorySelect.value = editLead.category;
      document.getElementById("customCategory").value = editLead.customCategory || "";
      toggleCustomCategory();
      document.getElementById("city").value = editLead.city || "";
      document.getElementById("state").value = editLead.state || "";
      document.getElementById("country").value = editLead.country || "";
      document.getElementById("address").value = editLead.address || "";
      document.getElementById("description").value = editLead.description || "";
      leadSourceSelect.value = editLead.leadSource;
      leadStatusSelect.value = editLead.leadStatus;
      document.getElementById("displayLeadId").value = editLead.id;
      document.getElementById("displayAddedBy").value = editLead.addedBy;
      document.getElementById("displayAddedDate").value = editLead.addedDate;
      document.getElementById("displayAddedTime").value = editLead.addedTime;
    } else {
      resetLeadForm();
    }
  }

  function resetLeadForm() {
    leadForm.reset();
    leadEditId.value = "";
    document.getElementById("leadFormTitle").textContent = "Add New Lead";
    document.getElementById("leadFormSubmitLabel").textContent = "Save Lead";
    document.getElementById("leadFormCancel").hidden = true;
    document.getElementById("autoFields").hidden = true;
    customCategoryField.hidden = true;
    var settings = LF.getSettings();
    leadStatusSelect.value = settings.defaultLeadStatus || "New";
    leadSourceSelect.value = settings.defaultLeadSource || "Website";
  }

  function toggleCustomCategory() {
    customCategoryField.hidden = categorySelect.value !== "Other";
  }

  function getFormData() {
    return {
      leadName: document.getElementById("leadName").value.trim(),
      businessName: document.getElementById("businessName").value.trim(),
      email: document.getElementById("email").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      website: document.getElementById("website").value.trim(),
      category: categorySelect.value,
      customCategory: categorySelect.value === "Other" ? document.getElementById("customCategory").value.trim() : "",
      city: document.getElementById("city").value.trim(),
      state: document.getElementById("state").value.trim(),
      country: document.getElementById("country").value.trim(),
      address: document.getElementById("address").value.trim(),
      description: document.getElementById("description").value.trim(),
      leadSource: leadSourceSelect.value,
      leadStatus: leadStatusSelect.value,
    };
  }

  function validateLeadData(data) {
    if (!data.leadName) return "Lead name is required.";
    if (!data.businessName) return "Business name is required.";
    if (!data.email) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return "Enter a valid email address.";
    if (!data.category) return "Category is required.";
    if (data.category === "Other" && !data.customCategory) return "Custom category is required when Other is selected.";
    return null;
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    var data = getFormData();
    var err = validateLeadData(data);
    if (err) { LF.showToast(err, "error"); return; }

    var editId = leadEditId.value;
    if (editId) {
      var updated = LF.updateLead(editId, data, session);
      if (!updated) { LF.showToast("Unable to update lead.", "error"); return; }
      LF.showToast("Lead updated successfully.", "success");
    } else {
      LF.addLead(data, session);
      LF.showToast("Lead created successfully.", "success");
    }

    resetLeadForm();
    leadFormSection.classList.remove("collapsible--open");
    renderStats();
    renderTable();
    populateSelects();
  }

  /* ─── View lead modal ────────────────────────────────────────────── */
  function viewLead(id) {
    var lead = LF.getLeads().find(function (l) { return l.id === id; });
    if (!lead) return;
    state.viewLeadId = id;
    var catDisplay = lead.category === "Other" && lead.customCategory ? lead.customCategory : lead.category;
    document.getElementById("viewLeadBody").innerHTML =
      '<div class="detail-grid">' +
      detailItem("Lead ID", lead.id) +
      detailItem("Status", '<span class="badge ' + LF.statusBadgeClass(lead.leadStatus) + '">' + LF.escapeHtml(lead.leadStatus) + "</span>") +
      detailItem("Lead Name", lead.leadName) +
      detailItem("Business", lead.businessName) +
      detailItem("Email", lead.email) +
      detailItem("Phone", lead.phone || "—") +
      detailItem("Website", lead.website ? '<a href="' + LF.escapeHtml(lead.website) + '" target="_blank" rel="noopener">' + LF.escapeHtml(lead.website) + "</a>" : "—") +
      detailItem("Category", catDisplay) +
      detailItem("Source", lead.leadSource) +
      detailItem("City", lead.city || "—") +
      detailItem("State", lead.state || "—") +
      detailItem("Country", lead.country || "—") +
      detailItem("Address", lead.address || "—") +
      detailItem("Added By", lead.addedBy) +
      detailItem("Added Date", lead.addedDate + " " + lead.addedTime) +
      "</div>" +
      (lead.description ? '<div style="margin-top:1rem"><div class="detail-item__label">Description</div><div class="detail-item__value">' + LF.escapeHtml(lead.description) + "</div></div>" : "");
    document.getElementById("viewLeadTitle").textContent = lead.leadName + " — " + lead.businessName;
    LF.openModal("viewLeadModal");
  }

  function detailItem(label, value) {
    return '<div class="detail-item"><div class="detail-item__label">' + label + '</div><div class="detail-item__value">' + value + "</div></div>";
  }

  /* ─── Import / Export ────────────────────────────────────────────── */
  function handleImportFile(file) {
    var reader = new FileReader();
    reader.onload = function (ev) {
      state.importRows = LF.parseCSV(ev.target.result).filter(function (r) { return r.leadName; });
      document.getElementById("importPreview").hidden = false;
      document.getElementById("importCount").textContent = state.importRows.length;
      document.getElementById("confirmImportBtn").disabled = state.importRows.length === 0;
    };
    reader.readAsText(file);
  }

  function confirmImport() {
    var count = 0;
    state.importRows.forEach(function (row) {
      if (row.leadName && row.email) {
        LF.addLead(row, session);
        count++;
      }
    });
    LF.showToast(count + " lead(s) imported.", "success");
    state.importRows = [];
    LF.closeModal("importModal");
    renderStats();
    renderTable();
    populateSelects();
  }

  function exportCSV() {
    var leads = getFilteredLeads();
    LF.downloadFile(LF.leadsToCSV(leads), "leadflow-leads-" + LF.formatISODate(new Date()) + ".csv", "text/csv");
    LF.showToast("CSV exported (" + leads.length + " leads).", "success");
    LF.logActivity("system", "Exported " + leads.length + " leads to CSV.", session.username);
  }

  function exportJSON() {
    var leads = getFilteredLeads();
    LF.downloadFile(JSON.stringify(leads, null, 2), "leadflow-leads-" + LF.formatISODate(new Date()) + ".json", "application/json");
    LF.showToast("JSON exported (" + leads.length + " leads).", "success");
    LF.logActivity("system", "Exported " + leads.length + " leads to JSON.", session.username);
  }

  function printTable() {
    window.print();
  }

  /* ─── Event bindings ─────────────────────────────────────────────── */
  function bindEvents() {
    leadFormToggle.addEventListener("click", function () {
      leadFormSection.classList.toggle("collapsible--open");
      leadFormToggle.setAttribute("aria-expanded", leadFormSection.classList.contains("collapsible--open"));
    });

    document.getElementById("addLeadBtn").addEventListener("click", function () {
      resetLeadForm();
      openLeadForm(null);
    });

    document.getElementById("leadFormCancel").addEventListener("click", function () {
      resetLeadForm();
      leadFormSection.classList.remove("collapsible--open");
    });

    categorySelect.addEventListener("change", toggleCustomCategory);
    leadForm.addEventListener("submit", handleFormSubmit);

    [tableSearch, filterStatus, filterCategory, filterOwner].forEach(function (el) {
      el.addEventListener("input", function () { state.page = 1; renderTable(); });
      el.addEventListener("change", function () { state.page = 1; renderTable(); });
    });

    pageSizeSelect.addEventListener("change", function () {
      state.pageSize = parseInt(pageSizeSelect.value, 10);
      state.page = 1;
      renderTable();
    });

    document.querySelectorAll("#leadsTable th[data-sort]").forEach(function (th) {
      th.addEventListener("click", function () {
        var key = th.getAttribute("data-sort");
        if (state.sortKey === key) state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
        else { state.sortKey = key; state.sortDir = "asc"; }
        renderTable();
      });
    });

    leadsTableBody.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-action]");
      if (btn) {
        var id = btn.getAttribute("data-id");
        var action = btn.getAttribute("data-action");
        if (action === "view") viewLead(id);
        else if (action === "edit") {
          var lead = LF.getLeads().find(function (l) { return l.id === id; });
          if (lead) openLeadForm(lead);
        } else if (action === "delete") {
          var l = LF.getLeads().find(function (x) { return x.id === id; });
          if (l) {
            state.deleteLeadId = id;
            document.getElementById("deleteLeadName").textContent = l.leadName;
            LF.openModal("deleteModal");
          }
        }
        return;
      }
      var copyBtn = e.target.closest("[data-copy]");
      if (copyBtn) {
        LF.copyToClipboard(copyBtn.getAttribute("data-copy")).then(function () {
          LF.showToast("Copied to clipboard.", "success");
        });
      }
    });

    paginationControls.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-page]");
      if (!btn || btn.disabled) return;
      var p = btn.getAttribute("data-page");
      if (p === "prev") state.page--;
      else if (p === "next") state.page++;
      else state.page = parseInt(p, 10);
      renderTable();
    });

    document.getElementById("confirmDeleteBtn").addEventListener("click", function () {
      if (state.deleteLeadId && LF.deleteLead(state.deleteLeadId, session)) {
        LF.showToast("Lead deleted.", "success");
        renderStats();
        renderTable();
      } else {
        LF.showToast("Unable to delete lead.", "error");
      }
      state.deleteLeadId = null;
      LF.closeModal("deleteModal");
    });

    document.getElementById("viewEditBtn").addEventListener("click", function () {
      LF.closeModal("viewLeadModal");
      var lead = LF.getLeads().find(function (l) { return l.id === state.viewLeadId; });
      if (lead) openLeadForm(lead);
    });

    document.getElementById("importBtn").addEventListener("click", function () {
      state.importRows = [];
      document.getElementById("importPreview").hidden = true;
      document.getElementById("confirmImportBtn").disabled = true;
      document.getElementById("importFileInput").value = "";
      LF.openModal("importModal");
    });

    document.getElementById("importFileInput").addEventListener("change", function (e) {
      if (e.target.files[0]) handleImportFile(e.target.files[0]);
    });

    var dropZone = document.getElementById("importDropZone");
    dropZone.addEventListener("dragover", function (e) { e.preventDefault(); dropZone.classList.add("backup-zone--drag"); });
    dropZone.addEventListener("dragleave", function () { dropZone.classList.remove("backup-zone--drag"); });
    dropZone.addEventListener("drop", function (e) {
      e.preventDefault();
      dropZone.classList.remove("backup-zone--drag");
      if (e.dataTransfer.files[0]) handleImportFile(e.dataTransfer.files[0]);
    });

    document.getElementById("confirmImportBtn").addEventListener("click", confirmImport);
    document.getElementById("exportCsvBtn").addEventListener("click", exportCSV);
    document.getElementById("exportJsonBtn").addEventListener("click", exportJSON);
    document.getElementById("printBtn").addEventListener("click", printTable);

    var globalSearch = document.getElementById("globalSearch");
    if (globalSearch) {
      globalSearch.addEventListener("input", function () {
        tableSearch.value = globalSearch.value;
        state.page = 1;
        renderTable();
      });
    }
  }

  init();
})();
