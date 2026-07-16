/**
 * LeadFlow CRM — Settings, backup/restore, activity timeline
 */
(function () {
  "use strict";

  var LF = window.LeadFlow;
  var session = LF.initAppShell("settings");
  if (!session) return;

  var activityFilter = "";
  var activitySearch = "";

  var activityIcons = {
    lead: { icon: "fa-user-plus", cls: "timeline__dot--lead" },
    auth: { icon: "fa-right-to-bracket", cls: "timeline__dot--auth" },
    category: { icon: "fa-tags", cls: "timeline__dot--category" },
    user: { icon: "fa-users", cls: "timeline__dot--user" },
    system: { icon: "fa-gear", cls: "timeline__dot--system" },
  };

  function loadSettingsForm() {
    var s = LF.getSettings();
    document.getElementById("companyName").value = s.companyName || "";
    document.getElementById("timezone").value = s.timezone || "America/New_York";
    document.getElementById("leadsPerPage").value = String(s.leadsPerPage || 10);
    document.getElementById("defaultLeadStatus").innerHTML = LF.LEAD_STATUSES.map(function (st) {
      return '<option value="' + st + '">' + st + "</option>";
    }).join("");
    document.getElementById("defaultLeadSource").innerHTML = LF.LEAD_SOURCES.map(function (src) {
      return '<option value="' + src + '">' + src + "</option>";
    }).join("");
    document.getElementById("defaultLeadStatus").value = s.defaultLeadStatus || "New";
    document.getElementById("defaultLeadSource").value = s.defaultLeadSource || "Website";
    document.getElementById("emailNotifications").checked = !!s.emailNotifications;
    document.getElementById("desktopNotifications").checked = !!s.desktopNotifications;
    document.getElementById("autoBackup").checked = !!s.autoBackup;
  }

  function saveGeneralSettings(e) {
    e.preventDefault();
    var settings = LF.getSettings();
    settings.companyName = document.getElementById("companyName").value.trim();
    settings.timezone = document.getElementById("timezone").value;
    settings.leadsPerPage = parseInt(document.getElementById("leadsPerPage").value, 10);
    settings.defaultLeadStatus = document.getElementById("defaultLeadStatus").value;
    settings.defaultLeadSource = document.getElementById("defaultLeadSource").value;
    LF.saveSettings(settings);
    LF.logActivity("system", "General settings updated.", session.username);
    LF.showToast("Settings saved.", "success");
  }

  function saveNotificationSettings(e) {
    e.preventDefault();
    var settings = LF.getSettings();
    settings.emailNotifications = document.getElementById("emailNotifications").checked;
    settings.desktopNotifications = document.getElementById("desktopNotifications").checked;
    settings.autoBackup = document.getElementById("autoBackup").checked;
    LF.saveSettings(settings);
    LF.logActivity("system", "Notification preferences updated.", session.username);
    LF.showToast("Preferences saved.", "success");
  }

  function switchSection(name) {
    document.querySelectorAll(".settings-nav__btn").forEach(function (btn) {
      btn.classList.toggle("settings-nav__btn--active", btn.getAttribute("data-section") === name);
    });
    document.querySelectorAll(".settings-section").forEach(function (sec) {
      sec.classList.toggle("settings-section--active", sec.id === "section-" + name);
    });
    if (name === "activity") renderActivity();
  }

  function renderActivity() {
    var activities = LF.getActivities().filter(function (a) {
      if (activityFilter && a.type !== activityFilter) return false;
      if (activitySearch) {
        var q = activitySearch.toLowerCase();
        return (a.message + " " + a.user).toLowerCase().indexOf(q) !== -1;
      }
      return true;
    });

    var timeline = document.getElementById("activityTimeline");
    if (activities.length === 0) {
      timeline.innerHTML = '<div class="table-empty"><i class="fa-solid fa-clock-rotate-left"></i>No activity recorded yet.</div>';
      return;
    }

    timeline.innerHTML = activities.slice(0, 100).map(function (a) {
      var meta = activityIcons[a.type] || activityIcons.system;
      return (
        '<div class="timeline__item">' +
        '<span class="timeline__dot ' + meta.cls + '"><i class="fa-solid ' + meta.icon + '"></i></span>' +
        "<div><div class=\"timeline__message\">" + LF.escapeHtml(a.message) + "</div>" +
        '<div class="timeline__meta">' + LF.escapeHtml(a.user) + " · " + LF.formatDisplayDateTime(a.timestamp) + "</div></div></div>"
      );
    }).join("");
  }

  function downloadBackup() {
    var data = LF.exportAllData();
    LF.downloadFile(JSON.stringify(data, null, 2), "leadflow-backup-" + LF.formatISODate(new Date()) + ".json", "application/json");
    LF.logActivity("system", "Full backup downloaded.", session.username);
    LF.showToast("Backup downloaded.", "success");
  }

  function restoreBackup(file) {
    var reader = new FileReader();
    reader.onload = function (ev) {
      try {
        var payload = JSON.parse(ev.target.result);
        var result = LF.importAllData(payload, session);
        if (result.error) { LF.showToast(result.error, "error"); return; }
        LF.showToast("Backup restored successfully.", "success");
        loadSettingsForm();
        renderActivity();
      } catch (e) {
        LF.showToast("Invalid backup file.", "error");
      }
    };
    reader.readAsText(file);
  }

  LF.bindModalClosers();
  loadSettingsForm();

  document.querySelectorAll(".settings-nav__btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      switchSection(btn.getAttribute("data-section"));
    });
  });

  document.getElementById("generalSettingsForm").addEventListener("submit", saveGeneralSettings);
  document.getElementById("notificationSettingsForm").addEventListener("submit", saveNotificationSettings);
  document.getElementById("backupBtn").addEventListener("click", downloadBackup);

  document.getElementById("resetDataBtn").addEventListener("click", function () {
    LF.openModal("resetModal");
  });

  document.getElementById("confirmResetBtn").addEventListener("click", function () {
    LF.resetAllData(session);
    LF.closeModal("resetModal");
    loadSettingsForm();
    renderActivity();
    LF.showToast("Data reset to defaults.", "success");
  });

  var restoreZone = document.getElementById("restoreDropZone");
  var restoreInput = document.getElementById("restoreFileInput");

  restoreZone.addEventListener("dragover", function (e) { e.preventDefault(); restoreZone.classList.add("backup-zone--drag"); });
  restoreZone.addEventListener("dragleave", function () { restoreZone.classList.remove("backup-zone--drag"); });
  restoreZone.addEventListener("drop", function (e) {
    e.preventDefault();
    restoreZone.classList.remove("backup-zone--drag");
    if (e.dataTransfer.files[0]) restoreBackup(e.dataTransfer.files[0]);
  });
  restoreInput.addEventListener("change", function (e) {
    if (e.target.files[0]) restoreBackup(e.target.files[0]);
  });

  document.getElementById("activityFilters").addEventListener("click", function (e) {
    var chip = e.target.closest(".filter-chip");
    if (!chip) return;
    activityFilter = chip.getAttribute("data-filter");
    document.querySelectorAll(".filter-chip").forEach(function (c) {
      c.classList.toggle("filter-chip--active", c === chip);
    });
    renderActivity();
  });

  document.getElementById("clearActivityFilter").addEventListener("click", function () {
    activityFilter = "";
    activitySearch = "";
    document.getElementById("globalSearch").value = "";
    document.querySelectorAll(".filter-chip").forEach(function (c, i) {
      c.classList.toggle("filter-chip--active", i === 0);
    });
    renderActivity();
  });

  document.getElementById("globalSearch").addEventListener("input", function (e) {
    activitySearch = e.target.value;
    if (document.getElementById("section-activity").classList.contains("settings-section--active")) {
      renderActivity();
    }
  });

  renderActivity();
})();
